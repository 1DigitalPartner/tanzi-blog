#!/bin/bash

# 🚀 GitHub Actions Deployment Setup Script
# This script sets up your blog for 24/7 automated deployment in the cloud

echo "🚀 TanziTech Blog - GitHub Actions Setup"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed. Please install git first.${NC}"
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📝 Initializing git repository...${NC}"
    git init
    git add .
    git commit -m "Initial commit: TanziTech blog with automated deployment"
    git branch -M main
    echo -e "${GREEN}✅ Git repository initialized${NC}"
else
    echo -e "${GREEN}✅ Git repository already exists${NC}"
fi

echo ""
echo -e "${BLUE}🔧 SETUP INSTRUCTIONS${NC}"
echo "===================="
echo ""
echo "To complete the GitHub Actions setup:"
echo ""

echo -e "${YELLOW}1. Create GitHub Repository:${NC}"
echo "   • Go to https://github.com/new"
echo "   • Repository name: tanzitech-blog"
echo "   • Make it public (for free Actions)"
echo "   • Don't initialize with README (we have files already)"
echo ""

echo -e "${YELLOW}2. Connect Local Repository to GitHub:${NC}"
echo "   Replace 'yourusername' with your GitHub username:"
echo ""
echo -e "${GREEN}   git remote add origin https://github.com/yourusername/tanzitech-blog.git${NC}"
echo -e "${GREEN}   git push -u origin main${NC}"
echo ""

echo -e "${YELLOW}3. Configure GitHub Secrets (for social media APIs):${NC}"
echo "   Go to your repository → Settings → Secrets and Variables → Actions"
echo "   Add these secrets:"
echo ""
echo "   🐦 Twitter/X API:"
echo "   • TWITTER_API_KEY"
echo "   • TWITTER_API_SECRET" 
echo "   • TWITTER_ACCESS_TOKEN"
echo "   • TWITTER_ACCESS_SECRET"
echo ""
echo "   💼 LinkedIn API:"
echo "   • LINKEDIN_CLIENT_ID"
echo "   • LINKEDIN_CLIENT_SECRET"
echo "   • LINKEDIN_ACCESS_TOKEN"
echo ""
echo "   ✍️ Medium API:"
echo "   • MEDIUM_INTEGRATION_TOKEN"
echo ""
echo "   🤖 Reddit API:"
echo "   • REDDIT_CLIENT_ID"
echo "   • REDDIT_CLIENT_SECRET"
echo "   • REDDIT_USERNAME"
echo "   • REDDIT_PASSWORD"
echo ""
echo "   👨‍💻 Dev.to API:"
echo "   • DEVTO_API_KEY"
echo ""

echo -e "${YELLOW}4. Test the Setup:${NC}"
echo "   • Go to your repository → Actions tab"
echo "   • Click 'Run workflow' on 'Blog Deployment & Crossposting'"
echo "   • Select 'full' deployment type"
echo "   • Click 'Run workflow'"
echo ""

echo -e "${YELLOW}5. Schedule Configuration:${NC}"
echo "   Current schedule: Monday, Wednesday, Friday at 9 AM UTC"
echo "   To change: Edit .github/workflows/deploy-and-crosspost.yml"
echo ""
echo "   Schedule examples:"
echo "   • Daily at 2 PM UTC: '0 14 * * *'"
echo "   • Twice daily: '0 9,18 * * *'"
echo "   • Weekdays only: '0 9 * * 1-5'"
echo ""

# Check current Git remote
CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "not-set")

if [ "$CURRENT_REMOTE" != "not-set" ]; then
    echo -e "${GREEN}✅ Git remote already configured:${NC} $CURRENT_REMOTE"
    echo ""
    echo -e "${BLUE}🚀 Ready to push to GitHub:${NC}"
    echo -e "${GREEN}   git push origin main${NC}"
else
    echo -e "${YELLOW}⚠️  Git remote not configured yet${NC}"
    echo "   Run the git remote command above after creating your GitHub repo"
fi

echo ""
echo -e "${BLUE}📋 WHAT HAPPENS AFTER SETUP:${NC}"
echo "=========================="
echo ""
echo "✅ Your blog will deploy automatically on schedule"
echo "✅ Content will crosspost to all social platforms"
echo "✅ Your Mac can be off - everything runs in GitHub's cloud"
echo "✅ You get notifications when deployments complete"
echo "✅ Full analytics and logs are preserved"
echo ""

echo -e "${BLUE}📱 MOBILE WORKFLOW:${NC}"
echo "=================="
echo ""
echo "Once set up, you can:"
echo "• Create new blog posts on any device"
echo "• Push to GitHub using mobile apps"
echo "• Everything deploys automatically"
echo "• Content appears on all platforms"
echo ""

# Create a quick reference file
cat > github-actions-reference.md << EOF
# 🚀 GitHub Actions Quick Reference

## Repository Setup
\`\`\`bash
git remote add origin https://github.com/yourusername/tanzitech-blog.git
git push -u origin main
\`\`\`

## Manual Deployment
- Go to Actions tab in your GitHub repository
- Select "Blog Deployment & Crossposting"
- Click "Run workflow"
- Choose deployment type and run

## Schedule Modification
Edit \`.github/workflows/deploy-and-crosspost.yml\`:

\`\`\`yaml
schedule:
  - cron: '0 9 * * 1,3,5'  # Mon, Wed, Fri at 9 AM UTC
\`\`\`

## Monitoring
- Actions tab: See all workflow runs
- Artifacts: Download deployment logs
- Notifications: Configure in GitHub settings

## Mobile Publishing
1. Edit posts in GitHub mobile app or any git client
2. Commit and push changes
3. Actions automatically triggers deployment
4. Content appears on all platforms

## API Keys Setup
Repository → Settings → Secrets and Variables → Actions

Required secrets:
- TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET
- LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_ACCESS_TOKEN  
- MEDIUM_INTEGRATION_TOKEN
- REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, REDDIT_PASSWORD
- DEVTO_API_KEY

## Troubleshooting
- Check Actions tab for error logs
- Verify API keys are correctly set
- Ensure repository is public (for free tier)
- Check rate limits on social platforms
EOF

echo -e "${GREEN}✅ Created github-actions-reference.md for future reference${NC}"
echo ""

echo -e "${BLUE}🎯 NEXT STEPS:${NC}"
echo "============="
echo ""
echo "1. Create GitHub repository (link above)"
echo "2. Run the git commands to connect and push"
echo "3. Add API keys to GitHub Secrets"
echo "4. Test with manual workflow run"
echo "5. Your blog is now 24/7 automated! 🎉"
echo ""

echo -e "${GREEN}🎉 Setup script completed!${NC}"
echo -e "${BLUE}💡 Tip: Keep the github-actions-reference.md file handy${NC}"
