const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailConfigs() {
    const configs = [
        {
            name: 'Google Workspace (Gmail)',
            config: {
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            }
        },
        {
            name: 'Google SMTP Direct',
            config: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            }
        },
        {
            name: 'Google SMTP SSL',
            config: {
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            }
        }
    ];

    console.log(`🧪 Testing email configurations for: ${process.env.EMAIL_USER}`);
    console.log('');

    for (const { name, config } of configs) {
        try {
            console.log(`📧 Testing: ${name}`);
            const transporter = nodemailer.createTransport(config);
            
            console.log('   Verifying connection...');
            await transporter.verify();
            
            console.log(`   ✅ SUCCESS: ${name} works!`);
            console.log('   This configuration can be used for your campaign.');
            console.log('');
            return config;
            
        } catch (error) {
            console.log(`   ❌ FAILED: ${name}`);
            console.log(`   Error: ${error.message}`);
            console.log('');
        }
    }
    
    console.log('🤔 None of the Gmail configurations worked.');
    console.log('');
    console.log('💡 Possible solutions:');
    console.log('1. Your domain might use a different email provider (Microsoft 365, etc.)');
    console.log('2. App Password might need to be regenerated');
    console.log('3. 2-Factor Authentication might not be fully enabled');
    console.log('4. Domain admin might have restricted app access');
    console.log('');
    console.log('🔍 Next steps:');
    console.log('- Check which email service your domain actually uses');
    console.log('- Try generating a new App Password');
    console.log('- Contact your domain administrator if needed');
}

testEmailConfigs().catch(console.error);
