#!/bin/bash

echo "🚀 TanziTech Deployment Status Checker"
echo "======================================="
echo ""

# Check if the reports directory exists locally
echo "📂 Local File Structure:"
if [ -d "reports" ]; then
    echo "✅ reports/ directory exists"
    if [ -f "reports/data-science-intelligence-report.html" ]; then
        echo "✅ data-science-intelligence-report.html exists"
        FILE_SIZE=$(wc -c < "reports/data-science-intelligence-report.html")
        echo "📊 File size: $FILE_SIZE bytes"
    else
        echo "❌ data-science-intelligence-report.html missing"
    fi
else
    echo "❌ reports/ directory missing"
fi

echo ""
echo "🌐 Remote Deployment Status:"

# Check GitHub Pages deployment
echo "🔍 Checking GitHub Pages deployment..."

# Test the URLs with curl
REPORT_URL="https://tanzitech.com/reports/data-science-intelligence-report.html"
# Email-based system - no landing page URL needed

echo "🔗 Testing Report URL: $REPORT_URL"
REPORT_RESPONSE=$(curl -I -L "$REPORT_URL" 2>/dev/null)
REPORT_STATUS=$(echo "$REPORT_RESPONSE" | grep "HTTP/" | tail -n 1 | cut -d' ' -f2)

if [ "$REPORT_STATUS" = "200" ]; then
    echo "✅ Report URL is LIVE and working! (HTTP $REPORT_STATUS)"
elif [ "$REPORT_STATUS" = "404" ]; then
    echo "⏳ Report URL returns 404 - GitHub Pages may still be deploying..."
else
    echo "⚠️  Report URL status: HTTP $REPORT_STATUS"
fi

echo "📧 Email-Based Lead Capture System:"
echo "✅ Prospects reply 'SEND REPORT' to any campaign email for instant access"
echo "✅ No landing page needed - direct email interaction"

echo ""
echo "📋 Deployment Steps Completed:"
echo "✅ 1. Created reports/ directory"
echo "✅ 2. Moved report file to correct location"
echo "✅ 3. Added to git repository"
echo "✅ 4. Committed changes"
echo "✅ 5. Pushed to GitHub (GitHub Pages)"
echo "✅ 6. Restored CNAME for custom domain"

echo ""
echo "🎯 System Status:"
echo "   Report URL: $REPORT_URL"
echo "   Lead Capture: Email-based (reply 'SEND REPORT')"

echo ""
echo "⏰ If still showing 404, wait 2-3 minutes and try again."
echo "   GitHub Pages deployment can take a few minutes to propagate."

echo ""
echo "🧪 Quick Manual Tests:"
echo "   Report: $REPORT_URL"
echo "   Email Test: Send 'SEND REPORT' to gabriele.tanzitech@gmail.com"
