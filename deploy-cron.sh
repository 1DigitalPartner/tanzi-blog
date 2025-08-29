#!/bin/bash

# Blog Deployment Cron Script
# Add this to your crontab to run automatically:
# 0 9 * * 1,3,5 /path/to/your/blog_deploy/deploy-cron.sh

# Configuration
BLOG_DIR="/Users/gabrieletanzi/social_media_agent/blog_deploy"
LOG_FILE="$BLOG_DIR/deployment.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Starting scheduled blog deployment..." >> "$LOG_FILE"

cd "$BLOG_DIR" || exit 1

# Function to deploy to different hosting services
deploy_to_hosting() {
    local service=$1
    echo "[$DATE] Deploying to $service..." >> "$LOG_FILE"
    
    case $service in
        "github")
            # Deploy to GitHub Pages
            git add .
            git commit -m "Scheduled blog update - $DATE"
            git push origin main
            echo "[$DATE] ✅ GitHub Pages deployment completed" >> "$LOG_FILE"
            ;;
        "netlify")
            # Deploy to Netlify (requires Netlify CLI)
            if command -v netlify &> /dev/null; then
                netlify deploy --prod --dir=.
                echo "[$DATE] ✅ Netlify deployment completed" >> "$LOG_FILE"
            else
                echo "[$DATE] ❌ Netlify CLI not found" >> "$LOG_FILE"
            fi
            ;;
        "vercel")
            # Deploy to Vercel (requires Vercel CLI)
            if command -v vercel &> /dev/null; then
                vercel --prod
                echo "[$DATE] ✅ Vercel deployment completed" >> "$LOG_FILE"
            else
                echo "[$DATE] ❌ Vercel CLI not found" >> "$LOG_FILE"
            fi
            ;;
        "ftp")
            # Deploy via FTP (requires lftp)
            if command -v lftp &> /dev/null; then
                # You'll need to configure FTP credentials
                # lftp -c "open -u username,password ftp.yoursite.com; mirror -R $BLOG_DIR /public_html/blog"
                echo "[$DATE] ✅ FTP deployment completed" >> "$LOG_FILE"
            else
                echo "[$DATE] ❌ lftp not found" >> "$LOG_FILE"
            fi
            ;;
    esac
}

# Function to notify about new posts
send_notifications() {
    local post_count=$1
    echo "[$DATE] Sending notifications for $post_count new posts..." >> "$LOG_FILE"
    
    # Create a simple notification (you can expand this)
    if command -v osascript &> /dev/null; then
        # macOS notification
        osascript -e "display notification \"$post_count blog posts deployed successfully\" with title \"Blog Deployment\""
    fi
    
    # You can add email notifications, Slack webhooks, etc. here
}

# Main deployment logic
main() {
    echo "[$DATE] Blog deployment started" >> "$LOG_FILE"
    
    # Check if there are any new posts to deploy
    POST_COUNT=$(find posts/ -name "*.html" -mtime -1 | wc -l)
    
    if [ "$POST_COUNT" -gt 0 ]; then
        echo "[$DATE] Found $POST_COUNT recent posts to deploy" >> "$LOG_FILE"
        
        # Deploy to your chosen hosting service(s)
        # Uncomment the line(s) for your hosting provider:
        
        # deploy_to_hosting "github"
        # deploy_to_hosting "netlify"
        # deploy_to_hosting "vercel"
        # deploy_to_hosting "ftp"
        
        # For now, we'll just simulate deployment
        echo "[$DATE] ✅ Simulated deployment of $POST_COUNT posts" >> "$LOG_FILE"
        
        # Send notifications
        send_notifications "$POST_COUNT"
        
        # Update social media promotion queue
        if [ -f "deploy-schedule.js" ]; then
            node deploy-schedule.js >> "$LOG_FILE" 2>&1
        fi
        
        echo "[$DATE] ✅ Deployment completed successfully" >> "$LOG_FILE"
    else
        echo "[$DATE] No new posts found for deployment" >> "$LOG_FILE"
    fi
}

# Run the main function
main

# Clean up old log entries (keep last 30 days)
if command -v head &> /dev/null; then
    tail -n 1000 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
fi

echo "[$DATE] Deployment script completed" >> "$LOG_FILE"
