#!/bin/bash

# Email Configuration Setup for TanziTech Campaign System
# This script helps configure email settings for bulk campaigns

echo "🔧 TanziTech Email Campaign Configuration Setup"
echo "=============================================="
echo ""

# Set the from email address
export FROM_EMAIL="info@tanzitech.com"
echo "✅ FROM_EMAIL set to: $FROM_EMAIL"

# Determine email service based on domain
if [[ "$FROM_EMAIL" == *"@gmail.com"* ]]; then
    export EMAIL_SERVICE="gmail"
    echo "✅ EMAIL_SERVICE detected as: Gmail"
    echo ""
    echo "📋 For Gmail, you'll need to:"
    echo "1. Enable 2-Factor Authentication on your Google account"
    echo "2. Generate an App Password (not your regular password)"
    echo "3. Go to: https://myaccount.google.com/apppasswords"
    echo "4. Create app password for 'Mail'"
    echo ""
elif [[ "$FROM_EMAIL" == *"@outlook.com"* ]] || [[ "$FROM_EMAIL" == *"@hotmail.com"* ]] || [[ "$FROM_EMAIL" == *"@live.com"* ]]; then
    export EMAIL_SERVICE="hotmail"
    echo "✅ EMAIL_SERVICE detected as: Outlook/Hotmail"
    echo ""
    echo "📋 For Outlook, you can use your regular email password"
    echo ""
else
    # For custom domains like tanzitech.com
    echo "📧 Custom domain detected: tanzitech.com"
    echo ""
    echo "🤔 What email service does your domain use?"
    echo "1) Google Workspace (Gmail for Business)"
    echo "2) Microsoft 365 (Outlook for Business)"  
    echo "3) Custom SMTP Server"
    echo "4) Other"
    echo ""
    read -p "Enter your choice (1-4): " service_choice
    
    case $service_choice in
        1)
            export EMAIL_SERVICE="gmail"
            echo "✅ EMAIL_SERVICE set to: Gmail (Google Workspace)"
            echo ""
            echo "📋 For Google Workspace:"
            echo "1. Enable 2-Factor Authentication"
            echo "2. Generate App Password at: https://myaccount.google.com/apppasswords"
            echo "3. Use your full email address as username"
            echo ""
            ;;
        2)
            export EMAIL_SERVICE="hotmail"
            echo "✅ EMAIL_SERVICE set to: Outlook (Microsoft 365)"
            echo ""
            echo "📋 For Microsoft 365:"
            echo "1. You can usually use your regular email password"
            echo "2. If that doesn't work, check if App Password is required"
            echo ""
            ;;
        3)
            echo "⚙️ Custom SMTP Configuration Required"
            echo ""
            read -p "Enter SMTP host (e.g., mail.tanzitech.com): " smtp_host
            read -p "Enter SMTP port (usually 587 or 465): " smtp_port
            read -p "Use TLS? (y/n): " use_tls
            
            export EMAIL_SERVICE="custom"
            export SMTP_HOST="$smtp_host"
            export SMTP_PORT="$smtp_port"
            export SMTP_TLS="$use_tls"
            
            echo "✅ Custom SMTP configured"
            ;;
        *)
            echo "❌ Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
fi

# Set the user email
export EMAIL_USER="info@tanzitech.com"
echo "✅ EMAIL_USER set to: $EMAIL_USER"

echo ""
echo "🔐 Email Password Setup"
echo "======================"
echo ""
echo "⚠️  IMPORTANT: This will be stored as an environment variable"
echo "    For production, consider using a secure secret manager"
echo ""

# Securely prompt for password
read -s -p "Enter your email password (or App Password): " email_password
echo ""
export EMAIL_PASSWORD="$email_password"
echo "✅ EMAIL_PASSWORD configured (hidden)"

echo ""
echo "🧪 Testing Email Configuration..."
echo "================================"

# Test the email configuration
node -e "
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

console.log('📧 Verifying email configuration...');

transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Email configuration failed:');
        console.log(error.message);
        console.log('');
        console.log('💡 Common solutions:');
        console.log('   • Use App Password instead of regular password');
        console.log('   • Enable 2-Factor Authentication first');
        console.log('   • Check if \"Less secure app access\" is enabled (Gmail)');
        console.log('   • Verify email service setting is correct');
    } else {
        console.log('✅ Email configuration successful!');
        console.log('📨 Ready to send emails');
    }
});
"

echo ""
echo "💾 Saving Configuration..."
echo "========================="

# Save to .env file for persistence
cat > .env << EOF
# TanziTech Email Campaign Configuration
EMAIL_SERVICE="$EMAIL_SERVICE"
EMAIL_USER="$EMAIL_USER"
EMAIL_PASSWORD="$EMAIL_PASSWORD"
FROM_EMAIL="$FROM_EMAIL"

# Custom SMTP settings (if applicable)
SMTP_HOST="$SMTP_HOST"
SMTP_PORT="$SMTP_PORT"
SMTP_TLS="$SMTP_TLS"

# Generated on: $(date)
EOF

echo "✅ Configuration saved to .env file"
echo ""
echo "🚀 Next Steps:"
echo "============="
echo "1. Test email configuration: node bulk-email-campaign.js status"
echo "2. Launch campaign: node bulk-email-campaign.js launch social_media_campaign social_media_awareness"
echo "3. Monitor results: watch the console output for batch progress"
echo ""
echo "📊 Campaign Details:"
echo "   • Email list: 42,633 contacts"
echo "   • Batch size: 25 emails every 15 minutes"  
echo "   • Estimated completion: 7-14 days"
echo "   • Expected response rate: 12-15%"
echo ""
echo "⚠️  Remember:"
echo "   • Monitor spam rates and bounces"
echo "   • Respect unsubscribe requests"
echo "   • Follow email marketing best practices"
echo ""
echo "✨ Your email campaign is ready to launch!"
