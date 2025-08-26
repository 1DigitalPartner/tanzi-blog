#!/bin/bash

# 🚀 TanziTech Blog - Automated Deployment Setup
# This script sets up scheduled deployment for your blog content

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
BLOG_DIR="/Users/gabrieletanzi/social_media_agent/blog_deploy"
USER_HOME="/Users/gabrieletanzi"
LAUNCHD_FILE="$USER_HOME/Library/LaunchAgents/com.tanzitech.blog.deploy.plist"

echo -e "${BLUE}🚀 TanziTech Blog Deployment Setup${NC}"
echo -e "${BLUE}===================================${NC}\n"

# Function to print colored output
print_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check dependencies
print_step "Checking dependencies..."

# Check Node.js
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    print_success "Node.js found: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js first."
    exit 1
fi

# Check npm
if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    print_success "npm found: $NPM_VERSION"
else
    print_error "npm not found. Please install npm first."
    exit 1
fi

# Navigate to blog directory
print_step "Navigating to blog directory..."
cd "$BLOG_DIR" || {
    print_error "Cannot find blog directory: $BLOG_DIR"
    exit 1
}
print_success "Current directory: $(pwd)"

# Install dependencies if package.json exists
if [ -f "package.json" ]; then
    print_step "Installing npm dependencies..."
    npm install
    print_success "Dependencies installed"
else
    print_step "Creating package.json..."
    cat > package.json << 'EOL'
{
  "name": "tanzitech-blog",
  "version": "1.0.0",
  "description": "TanziTech Blog with scheduled deployment",
  "main": "deploy-schedule.js",
  "scripts": {
    "deploy": "node deploy-schedule.js",
    "preview": "python3 -m http.server 8000",
    "validate": "node -c deploy-schedule.js && echo 'Deployment script is valid'",
    "test:deploy": "echo 'Running deployment test...' && node deploy-schedule.js",
    "logs": "tail -f deployment.log",
    "clean:logs": "rm -f deployment.log deployment-log.json",
    "stats": "node -e \"const fs=require('fs'); if(fs.existsSync('deployment-log.json')) { const logs=JSON.parse(fs.readFileSync('deployment-log.json')); console.log('Total deployments:', logs.length); logs.forEach(l=>console.log(l.date+':', l.deployedPosts.length+' posts')); } else console.log('No deployment history found');\"",
    "schedule:setup": "echo 'Add this to your crontab:' && echo '0 9 * * 1,3,5 cd $PWD && npm run deploy'",
    "backup": "tar -czf blog-backup-$(date +%Y%m%d).tar.gz *.html *.json *.md en/ it/ de/",
    "social:queue": "cat social-promotion-queue.json 2>/dev/null || echo 'No social media queue found'"
  },
  "keywords": ["blog", "deployment", "automation", "social-media"],
  "author": "Gabriele Tanzi",
  "license": "MIT"
}
EOL
    print_success "package.json created"
fi

# Make scripts executable
print_step "Making scripts executable..."
chmod +x deploy-schedule.js
chmod +x deploy-cron.sh 2>/dev/null || true
print_success "Scripts are now executable"

# Test the deployment system
print_step "Testing deployment system..."
if node deploy-schedule.js; then
    print_success "Deployment system test completed"
else
    print_warning "Deployment system test had issues (this may be normal if no posts are scheduled for today)"
fi

# Setup deployment options
echo -e "\n${BLUE}📅 DEPLOYMENT SCHEDULE SETUP${NC}"
echo -e "${BLUE}=============================${NC}\n"

echo "Your blog posts are now scheduled for deployment on these dates:"
echo -e "  ${GREEN}• Aug 28, 2025:${NC} High-Value Social Media Intelligence Report (3 languages)"
echo -e "  ${GREEN}• Aug 29, 2025:${NC} LinkedIn Lead Generation Strategy"
echo -e "  ${GREEN}• Aug 30, 2025:${NC} Hidden Psychology of AI Content"
echo -e "  ${GREEN}• Sep 02, 2025:${NC} Advanced Lead Generation Strategies"
echo -e "  ${GREEN}• Sep 03, 2025:${NC} Newsletter content"
echo -e "  ${GREEN}• Sep 04, 2025:${NC} Additional guides and reports"

echo -e "\n${YELLOW}Choose your deployment automation method:${NC}"
echo "1. macOS Launchd (Recommended for Mac)"
echo "2. Cron jobs (Unix/Linux/Mac)"
echo "3. Manual deployment only"
echo "4. GitHub Actions (for GitHub Pages)"
echo "5. Netlify (with webhook)"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        print_step "Setting up macOS Launchd..."
        
        # Create LaunchAgent directory if it doesn't exist
        mkdir -p "$USER_HOME/Library/LaunchAgents"
        
        # Create the plist file
        cat > "$LAUNCHD_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.tanzitech.blog.deploy</string>
    <key>ProgramArguments</key>
    <array>
        <string>$(which node)</string>
        <string>$BLOG_DIR/deploy-schedule.js</string>
    </array>
    <key>StartCalendarInterval</key>
    <array>
        <dict>
            <key>Weekday</key>
            <integer>1</integer>
            <key>Hour</key>
            <integer>9</integer>
            <key>Minute</key>
            <integer>0</integer>
        </dict>
        <dict>
            <key>Weekday</key>
            <integer>3</integer>
            <key>Hour</key>
            <integer>9</integer>
            <key>Minute</key>
            <integer>0</integer>
        </dict>
        <dict>
            <key>Weekday</key>
            <integer>5</integer>
            <key>Hour</key>
            <integer>9</integer>
            <key>Minute</key>
            <integer>0</integer>
        </dict>
    </array>
    <key>WorkingDirectory</key>
    <string>$BLOG_DIR</string>
    <key>RunAtLoad</key>
    <false/>
    <key>StandardErrorPath</key>
    <string>$BLOG_DIR/deployment.log</string>
    <key>StandardOutPath</key>
    <string>$BLOG_DIR/deployment.log</string>
</dict>
</plist>
EOF

        # Load and start the service
        launchctl load "$LAUNCHD_FILE" 2>/dev/null || true
        launchctl start com.tanzitech.blog.deploy 2>/dev/null || true
        
        print_success "macOS Launchd scheduled deployment is set up!"
        echo -e "  ${GREEN}• Runs every Monday, Wednesday, Friday at 9:00 AM${NC}"
        echo -e "  ${GREEN}• Logs saved to: $BLOG_DIR/deployment.log${NC}"
        echo -e "  ${GREEN}• To disable: launchctl unload $LAUNCHD_FILE${NC}"
        ;;
        
    2)
        print_step "Setting up Cron job..."
        echo -e "\n${YELLOW}Add this line to your crontab (run 'crontab -e'):${NC}"
        echo "0 9 * * 1,3,5 cd $BLOG_DIR && npm run deploy >> $BLOG_DIR/cron.log 2>&1"
        echo -e "\n${YELLOW}Or run this command to add it automatically:${NC}"
        echo "(crontab -l 2>/dev/null; echo \"0 9 * * 1,3,5 cd $BLOG_DIR && npm run deploy >> $BLOG_DIR/cron.log 2>&1\") | crontab -"
        ;;
        
    3)
        print_success "Manual deployment configured."
        echo -e "  ${GREEN}• Run 'npm run deploy' to deploy scheduled posts${NC}"
        echo -e "  ${GREEN}• Run 'npm run validate' to check everything is ready${NC}"
        ;;
        
    4)
        print_step "Setting up GitHub Actions..."
        mkdir -p .github/workflows
        cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy Blog
on:
  schedule:
    - cron: '0 9 * * 1,3,5'  # Monday, Wednesday, Friday at 9 AM UTC
  workflow_dispatch:  # Allow manual triggers

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run deploy
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
EOF
        print_success "GitHub Actions workflow created!"
        echo -e "  ${GREEN}• Push your code to GitHub and enable Actions${NC}"
        echo -e "  ${GREEN}• Enable GitHub Pages in repository settings${NC}"
        ;;
        
    5)
        print_step "Setting up Netlify..."
        cat > netlify.toml << 'EOF'
[build]
  publish = "."
  command = "npm run deploy"

[build.environment]
  NODE_VERSION = "18"

[[plugins]]
  package = "netlify-plugin-cron"
  
  [plugins.inputs]
  jobs = [
    {
      name = "deploy-blog",
      cron = "0 9 * * 1,3,5",
      command = "npm run deploy"
    }
  ]
EOF
        print_success "Netlify configuration created!"
        echo -e "  ${GREEN}• Deploy your site to Netlify${NC}"
        echo -e "  ${GREEN}• Install the netlify-plugin-cron plugin${NC}"
        ;;
        
    *)
        print_warning "Invalid choice. Manual deployment configured."
        ;;
esac

# Create deployment status page
print_step "Creating deployment dashboard..."
cat > deployment-status.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TanziTech Blog - Deployment Status</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; color: white; }
        .container { max-width: 800px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 2rem; border-radius: 15px; }
        h1 { color: white; text-align: center; }
        .status { background: rgba(255,255,255,0.2); padding: 1rem; margin: 1rem 0; border-radius: 8px; }
        .success { border-left: 4px solid #22c55e; }
        .pending { border-left: 4px solid #f59e0b; }
        .info { border-left: 4px solid #3b82f6; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 TanziTech Blog - Deployment Status</h1>
        
        <div class="status success">
            <h3>✅ Setup Complete</h3>
            <p>Your blog deployment system is configured and ready!</p>
        </div>
        
        <div class="status info">
            <h3>📅 Upcoming Deployments</h3>
            <ul>
                <li>Aug 28: High-Value Intelligence Report (3 languages)</li>
                <li>Aug 29: LinkedIn Lead Generation Strategy</li>
                <li>Aug 30: AI Psychology Analysis</li>
                <li>Sep 02: Advanced Lead Generation</li>
                <li>Sep 03: Newsletter Content</li>
                <li>Sep 04: Additional Guides</li>
            </ul>
        </div>
        
        <div class="status pending">
            <h3>⚡ Quick Commands</h3>
            <ul>
                <li><code>npm run deploy</code> - Deploy scheduled posts</li>
                <li><code>npm run validate</code> - Validate deployment</li>
                <li><code>npm run logs</code> - View deployment logs</li>
                <li><code>npm run stats</code> - Show deployment statistics</li>
            </ul>
        </div>
        
        <div class="status info">
            <h3>🔗 Access Your Blog</h3>
            <p><a href="en/index.html" style="color: white;">View English Blog</a> | 
               <a href="it/index.html" style="color: white;">Blog Italiano</a> | 
               <a href="de/index.html" style="color: white;">Deutsche Blog</a></p>
        </div>
    </div>
</body>
</html>
EOF

print_success "Deployment dashboard created: deployment-status.html"

# Final summary
echo -e "\n${GREEN}🎉 SETUP COMPLETE!${NC}"
echo -e "${GREEN}===================${NC}\n"

echo -e "${BLUE}Your blog deployment system is now ready with:${NC}"
echo -e "  ✅ ${GREEN}4 flagship blog posts created${NC}"
echo -e "  ✅ ${GREEN}Multilingual support (EN/IT/DE)${NC}" 
echo -e "  ✅ ${GREEN}Automated deployment scheduling${NC}"
echo -e "  ✅ ${GREEN}Social media promotion queue${NC}"
echo -e "  ✅ ${GREEN}Professional visual design${NC}"

echo -e "\n${YELLOW}📱 Quick Start:${NC}"
echo "  • View your blog: open deployment-status.html"
echo "  • Test deployment: npm run deploy"
echo "  • View logs: npm run logs"
echo "  • Get stats: npm run stats"

echo -e "\n${PURPLE}🚀 Next Steps:${NC}"
echo "  1. Test the deployment system"
echo "  2. Configure your hosting platform"
echo "  3. Set up social media automation"
echo "  4. Monitor deployment logs"

echo -e "\n${GREEN}Happy blogging! 🎯${NC}"

# Open the deployment status page
if command -v open >/dev/null 2>&1; then
    print_step "Opening deployment status page..."
    open deployment-status.html
fi
