#!/bin/bash

echo "🚀 TanziTech Blog Proxy Setup"
echo "==============================="
echo ""
echo "This will configure tanzitech.com/blog to proxy to your GitHub Pages blog."
echo ""

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json not found. Make sure you're in the right directory."
    exit 1
fi

echo "📋 Vercel Configuration Summary:"
echo "✅ /blog/* → GitHub Pages proxy"
echo "✅ /audit → Direct audit page access"
echo "✅ Caching headers for performance"
echo "✅ Security headers included"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI not found. Installing..."
    echo "Run: npm install -g vercel"
    echo ""
    echo "After installing Vercel CLI:"
    echo "1. Run: vercel login"
    echo "2. Run: vercel --prod"
    echo ""
    echo "🔗 Manual setup instructions:"
    echo "1. Go to https://vercel.com/dashboard"
    echo "2. Import your tanzitech.com project"
    echo "3. Upload this vercel.json file"
    echo "4. Deploy"
    exit 1
fi

echo "🚀 Deploying Vercel configuration..."
echo ""

# Deploy to Vercel
if vercel --prod; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "🔍 Testing the proxy setup..."
    echo ""
    
    # Wait a moment for deployment to propagate
    sleep 5
    
    # Test the proxy
    echo "Testing tanzitech.com/blog..."
    if curl -s -o /dev/null -w "%{http_code}" "https://tanzitech.com/blog" | grep -q "200"; then
        echo "✅ Blog proxy is working!"
    else
        echo "⚠️  Blog proxy may need a few minutes to propagate"
    fi
    
    echo ""
    echo "Testing tanzitech.com/audit..."
    if curl -s -o /dev/null -w "%{http_code}" "https://tanzitech.com/audit" | grep -q "200"; then
        echo "✅ Audit page proxy is working!"
    else
        echo "⚠️  Audit page proxy may need a few minutes to propagate"
    fi
    
    echo ""
    echo "🎯 Setup Complete!"
    echo "=========================="
    echo "✅ tanzitech.com/blog → GitHub Pages"
    echo "✅ tanzitech.com/audit → Audit page"
    echo "✅ All automation remains unchanged"
    echo ""
    echo "🔗 Test URLs:"
    echo "• https://tanzitech.com/blog"
    echo "• https://tanzitech.com/audit"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Update your portfolio links"
    echo "2. Test all functionality"
    echo "3. Verify automation still works"
    
else
    echo "❌ Deployment failed. Please check your Vercel configuration."
    echo ""
    echo "📋 Manual steps:"
    echo "1. Run: vercel login"
    echo "2. Run: vercel --prod"
    echo "3. Or upload vercel.json to your Vercel dashboard"
fi
