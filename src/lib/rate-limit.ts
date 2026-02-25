import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Upstash Redis for rate limiting
const upstashRedis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Rate limit configurations
export const rateLimits = {
  // Standard API rate limit: 30 requests per minute
  standard: upstashRedis
    ? new Ratelimit({
        redis: upstashRedis,
        limiter: Ratelimit.slidingWindow(30, '1 m'),
        analytics: true,
      })
    : null,

  // Quiz generation: 5 requests per minute (expensive operation)
  quizGeneration: upstashRedis
    ? new Ratelimit({
        redis: upstashRedis,
        limiter: Ratelimit.slidingWindow(5, '1 m'),
        analytics: true,
      })
    : null,

  // Score submission: 10 requests per minute
  scoreSubmission: upstashRedis
    ? new Ratelimit({
        redis: upstashRedis,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        analytics: true,
      })
    : null,

  // Quiz fetching: 60 requests per minute
  quizFetch: upstashRedis
    ? new Ratelimit({
        redis: upstashRedis,
        limiter: Ratelimit.slidingWindow(60, '1 m'),
        analytics: true,
      })
    : null,
};

// Get client IP from request
export function getClientIP(request: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip ?? '127.0.0.1';
}

// Rate limit check result
interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Check rate limit and return response if exceeded
export async function checkRateLimit(
  request: NextRequest,
  ratelimit: Ratelimit | null,
  options: {
    errorMessage?: string;
    skipIfNoRedis?: boolean;
  } = {}
): Promise<{ allowed: true } | { allowed: false; response: NextResponse }> {
  const { errorMessage = 'For mange forespørsler', skipIfNoRedis = true } = options;

  // If no rate limiter configured and skipIfNoRedis is true, allow the request
  if (!ratelimit && skipIfNoRedis) {
    return { allowed: true };
  }

  // If no rate limiter configured and skipIfNoRedis is false, block the request
  if (!ratelimit && !skipIfNoRedis) {
    return {
      allowed: false,
      response: NextResponse.json(
        { error: 'Rate limiting not configured' },
        { status: 503 }
      ),
    };
  }

  const ip = getClientIP(request);
  
  try {
    const result = await ratelimit!.limit(ip);
    
    if (!result.success) {
      const response = NextResponse.json(
        { 
          error: errorMessage,
          limit: result.limit,
          remaining: result.remaining,
          reset: result.reset,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          }
        }
      );
      
      return { allowed: false, response };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    
    // If rate limit check fails, allow the request (fail open)
    // In production, you might want to fail closed
    return { allowed: true };
  }
}

// Middleware-style rate limit wrapper for API routes
export function withRateLimit(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  ratelimit: Ratelimit | null,
  options?: Parameters<typeof checkRateLimit>[2]
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const result = await checkRateLimit(request, ratelimit, options);
    
    if (!result.allowed) {
      return result.response;
    }
    
    return handler(request, ...args);
  };
}
