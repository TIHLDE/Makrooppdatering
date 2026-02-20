#!/bin/bash

# Makro Oppdatering - Production Setup Script
# Usage: ./scripts/setup.sh

set -e

echo "🚀 Makro Oppdatering Production Setup"
echo "======================================"
echo ""

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ required. Current: $(node --version)"
    exit 1
fi
echo "✓ Node.js version: $(node --version)"

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env and add your database URL and API keys"
    exit 1
fi
echo "✓ .env file exists"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo ""
echo "🔄 Generating Prisma client..."
npm run db:generate

# Check if migrations are needed
echo ""
echo "🔄 Checking database migrations..."
if npx prisma migrate status 2>&1 | grep -q "Database schema is up to date"; then
    echo "✓ Database is up to date"
else
    echo "⚠️  Database migrations needed"
    echo "   Run: npx prisma migrate dev"
fi

# Run type check
echo ""
echo "🔍 Running TypeScript check..."
if npm run typecheck; then
    echo "✓ TypeScript check passed"
else
    echo "⚠️  TypeScript errors found (see above)"
fi

# Build application
echo ""
echo "🏗️  Building application..."
npm run build

echo ""
echo "======================================"
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Ensure your .env has valid DATABASE_URL"
echo "2. Run: npm run db:migrate (if needed)"
echo "3. Start: npm run dev"
echo "4. Open: http://localhost:3000"
echo ""
echo "For production deployment:"
echo "- Set up Redis (Upstash) for rate limiting"
echo "- Add API keys for Alpha Vantage, CryptoCompare, Idun"
echo "- Configure Vercel/Deployment platform"
