#!/bin/bash

# JARVIS Assistant Complete Setup Script
# Run this after cloning the repository

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║        J.A.R.V.I.S. ASSISTANT - SETUP SCRIPT             ║"
echo "╚═══════════════════════════════════════════════════════════╝"

# Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js 16+ first."
  exit 1
fi

echo "✓ Node.js $(node --version) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
  echo "❌ npm install failed"
  exit 1
fi

echo "✓ Dependencies installed"

# Create .env if it doesn't exist
if [ ! -f .env ]; then
  echo ""
  echo "📝 Creating .env file..."
  cp .env.example .env
  echo "✓ .env created. Edit it with your API keys:"
  echo "  nano .env"
else
  echo "✓ .env already exists"
fi

# Create data directory
if [ ! -d data ]; then
  echo ""
  echo "📁 Creating data directory..."
  mkdir -p data
  echo "✓ data/ directory created"
fi

# Create logs directory
if [ ! -d logs ]; then
  echo ""
  echo "📁 Creating logs directory..."
  mkdir -p logs
  echo "✓ logs/ directory created"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                  SETUP COMPLETE!                          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Edit .env with your API keys:"
echo "   nano .env"
echo ""
echo "2. Start JARVIS:"
echo "   npm start          (production)"
echo "   npm run dev        (development with auto-reload)"
echo ""
echo "3. Open in browser:"
echo "   http://localhost:3001"
echo ""
echo "4. Run tests:"
echo "   npm test"
echo ""
echo "For more help, see SETUP.md"
