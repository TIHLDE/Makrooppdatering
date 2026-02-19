import { describe, it, expect } from 'vitest';
import { 
  generateHash, 
  extractTickers, 
  calculateRelevanceScore,
  truncateText,
  slugify 
} from '../src/lib/utils';

describe('Utils', () => {
  describe('generateHash', () => {
    it('should generate consistent hashes for same input', () => {
      const input = 'test string';
      const hash1 = generateHash(input);
      const hash2 = generateHash(input);
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = generateHash('test1');
      const hash2 = generateHash('test2');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('extractTickers', () => {
    it('should extract $TICKER format', () => {
      const text = 'Check out $AAPL and $TSLA today';
      const tickers = extractTickers(text);
      expect(tickers).toContain('AAPL');
      expect(tickers).toContain('TSLA');
    });

    it('should extract standalone uppercase tickers', () => {
      const text = 'AAPL and MSFT are performing well';
      const tickers = extractTickers(text);
      expect(tickers).toContain('AAPL');
      expect(tickers).toContain('MSFT');
    });

    it('should remove duplicates', () => {
      const text = '$AAPL $AAPL TSLA TSLA';
      const tickers = extractTickers(text);
      expect(tickers).toHaveLength(2);
    });
  });

  describe('calculateRelevanceScore', () => {
    it('should return base score with no factors', () => {
      const score = calculateRelevanceScore(null, false, false);
      expect(score).toBe(0.5);
    });

    it('should increase score with tickers', () => {
      const score = calculateRelevanceScore(null, true, false);
      expect(score).toBeGreaterThan(0.5);
    });

    it('should cap score at 1', () => {
      const score = calculateRelevanceScore(1, true, true);
      expect(score).toBe(1);
    });
  });

  describe('truncateText', () => {
    it('should not truncate short text', () => {
      const text = 'Short';
      expect(truncateText(text, 100)).toBe(text);
    });

    it('should truncate long text', () => {
      const text = 'This is a very long text that needs truncation';
      const result = truncateText(text, 10);
      expect(result).toHaveLength(13); // 10 + '...'
      expect(result.endsWith('...')).toBe(true);
    });
  });

  describe('slugify', () => {
    it('should convert to lowercase', () => {
      expect(slugify('HELLO')).toBe('hello');
    });

    it('should replace spaces with dashes', () => {
      expect(slugify('hello world')).toBe('hello-world');
    });

    it('should remove special characters', () => {
      expect(slugify('hello@world!')).toBe('helloworld');
    });
  });
});
