# 🚀 Blog Deployment Schedule Guide

## Quick Setup Commands

### 1. Test the Deployment System
```bash
# Preview your blog locally
npm run preview

# Validate all posts are ready
npm run validate

# Test deployment (dry run)
npm run test:deploy

# View deployment logs
npm run logs
```

### 2. Manual Deployment Options
```bash
# Deploy to GitHub Pages
npm run deploy:github

# Deploy to Netlify
npm run deploy:netlify

# Deploy to Vercel  
npm run deploy:vercel

# Custom deployment with schedule
npm run deploy
```

### 3. Schedule Automatic Deployment

#### Option A: Using Cron (Mac/Linux)
```bash
# Make the script executable
chmod +x deploy-cron.sh

# Get the cron command
npm run schedule:setup

# Edit your crontab
crontab -e

# Add this line for deployment every Monday, Wednesday, Friday at 9 AM:
0 9 * * 1,3,5 cd /Users/gabrieletanzi/social_media_agent/blog_deploy && npm run deploy
```

#### Option B: Using macOS Launchd
Create file: `~/Library/LaunchAgents/com.tanzitech.blog.deploy.plist`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.tanzitech.blog.deploy</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/Users/gabrieletanzi/social_media_agent/blog_deploy/deploy-schedule.js</string>
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
    <key>RunAtLoad</key>
    <false/>
    <key>StandardErrorPath</key>
    <string>/Users/gabrieletanzi/social_media_agent/blog_deploy/deployment.log</string>
    <key>StandardOutPath</key>
    <string>/Users/gabrieletanzi/social_media_agent/blog_deploy/deployment.log</string>
</dict>
</plist>
```

Then load it:
```bash
launchctl load ~/Library/LaunchAgents/com.tanzitech.blog.deploy.plist
launchctl start com.tanzitech.blog.deploy
```

## 📅 Current Deployment Schedule

### Configured Dates:
- **August 26, 2025**: Programming Trends + AI Technology posts
- **August 27, 2025**: Data Science + AI Strategy posts
- **August 28, 2025**: (Ready for more posts)

### Automatic Schedule:
- **Monday, 9:00 AM**: Deploy scheduled posts
- **Wednesday, 9:00 AM**: Deploy scheduled posts  
- **Friday, 9:00 AM**: Deploy scheduled posts

## 🔧 Hosting Platform Setup

### GitHub Pages
1. Push your blog to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Set up GitHub Actions (file already created)

### Netlify
1. Install Netlify CLI: `npm install -g netlify-cli`
2. Login: `netlify login`
3. Initialize: `netlify init`
4. Deploy: `npm run deploy:netlify`

### Vercel
1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Initialize: `vercel`
4. Deploy: `npm run deploy:vercel`

## 📊 Monitoring & Analytics

### View Statistics
```bash
# Blog stats
npm run stats

# Social media queue
npm run social:queue

# Create backup
npm run backup
```

### Log Management
```bash
# View real-time logs
npm run logs

# Clear logs
npm run clean:logs
```

## 🎯 Social Media Integration

The deployment system automatically creates a social media promotion queue when posts are deployed. You can integrate this with:

- **Buffer**: Import JSON queue
- **Hootsuite**: Schedule from queue
- **Custom automation**: Process queue with your tools
- **Zapier**: Connect to webhooks

## 🛠️ Customization

### Edit Deployment Schedule
Modify `DEPLOYMENT_SCHEDULE` in `deploy-schedule.js`:

```javascript
const DEPLOYMENT_SCHEDULE = {
  '2025-08-29': [
    'new-post-filename.html',
    'another-post-filename.html'
  ],
  '2025-08-30': [
    'weekend-post.html'
  ]
};
```

### Add New Hosting Provider
Edit the `deploy_to_hosting()` function in `deploy-cron.sh` or create new npm scripts in `package.json`.

### Customize Social Promotion
Modify `SOCIAL_PROMOTION` settings in `deploy-schedule.js`.

## 🚨 Troubleshooting

### Common Issues:
1. **Permission denied**: `chmod +x deploy-cron.sh`
2. **Node not found**: Check Node.js installation
3. **Git authentication**: Set up SSH keys or tokens
4. **Cron not running**: Check `crontab -l` and system logs

### Debug Commands:
```bash
# Test cron manually
./deploy-cron.sh

# Check Node script
node deploy-schedule.js

# Validate file permissions
ls -la *.sh *.js
```

## 📈 Success Metrics

After deployment, monitor:
- ✅ Deployment success rate
- 📊 Blog post engagement
- 🚀 Social media reach
- 📱 Website traffic
- 💼 Professional connections

---

**Ready to deploy?** Start with `npm run validate` then `npm run deploy`!
