#!/bin/bash

# TanziTech Autoresponder Dashboard Launcher
# Simple script to start the dashboard server

echo "🚀 Starting TanziTech Autoresponder Dashboard..."
echo "📂 Directory: $(pwd)"
echo "🐍 Using Python HTTP server for maximum compatibility"
echo ""

# Check if dashboard.html exists
if [ ! -f "dashboard.html" ]; then
    echo "❌ Error: dashboard.html not found in current directory"
    echo "💡 Please run this script from the blog_deploy directory"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python3 is not installed or not in PATH"
    echo "💡 Please install Python3 to run the dashboard"
    exit 1
fi

echo "✅ All checks passed! Starting server..."
echo "🌐 The dashboard will open automatically in your browser"
echo "🔥 Press Ctrl+C to stop the server when done"
echo ""

# Start the Python server
python3 serve-dashboard.py
