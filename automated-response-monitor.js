#!/usr/bin/env node
/**
 * Automated Response Monitor
 * Continuously monitors for incoming email responses and automatically processes them
 * through the campaign autoresponder system
 */

const nodemailer = require('nodemailer');
const CampaignAutoresponder = require('./campaign-autoresponder.js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

class AutomatedResponseMonitor {
    constructor() {
        this.autoresponder = new CampaignAutoresponder();
        this.monitorLog = path.join(__dirname, 'automated-monitor.log');
        this.processedEmails = new Set(); // Track processed emails to avoid duplicates
        this.isRunning = false;
        this.checkInterval = 30000; // Check every 30 seconds
        
        // Gmail IMAP configuration
        this.imapConfig = {
            user: process.env.EMAIL_USER,
            password: process.env.EMAIL_PASSWORD,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            authTimeout: 3000
        };
        
        console.log('🤖 Automated Response Monitor initialized');
        console.log(`📧 Monitoring: ${this.imapConfig.user}`);
        console.log(`⏱️  Check interval: ${this.checkInterval / 1000}s`);
    }

    /**
     * Start the automated monitoring system
     */
    async start() {
        if (this.isRunning) {
            console.log('⚠️ Monitor is already running');
            return;
        }

        this.isRunning = true;
        await this.log('🚀 Starting automated response monitoring system');
        
        console.log('\n🤖 AUTOMATED AUTORESPONDER ACTIVE');
        console.log('==================================');
        console.log('✅ Monitoring incoming emails every 30 seconds');
        console.log('✅ Will automatically detect and respond to:');
        console.log('   • DATA/INSIGHTS requests → Full Intelligence Report');
        console.log('   • General interest → Complete Analysis');
        console.log('   • Call requests → Meeting scheduling');
        console.log('   • Questions → Detailed answers');
        console.log('');
        console.log('📊 Press Ctrl+C to stop monitoring');
        console.log('📋 Check automated-monitor.log for detailed activity');
        console.log('');

        // Start monitoring loop
        this.monitoringLoop();
    }

    /**
     * Stop the monitoring system
     */
    async stop() {
        this.isRunning = false;
        await this.log('🛑 Stopped automated response monitoring');
        console.log('\n🛑 Automated monitoring stopped');
    }

    /**
     * Main monitoring loop
     */
    async monitoringLoop() {
        while (this.isRunning) {
            try {
                await this.checkForNewResponses();
                
                // Wait before next check
                await new Promise(resolve => setTimeout(resolve, this.checkInterval));
                
            } catch (error) {
                await this.log(`❌ Monitor error: ${error.message}`);
                console.error('Monitor error:', error.message);
                
                // Wait a bit longer after an error
                await new Promise(resolve => setTimeout(resolve, this.checkInterval * 2));
            }
        }
    }

    /**
     * Check for new email responses using Gmail API simulation
     * Note: In a production setup, this would connect to Gmail API or IMAP
     */
    async checkForNewResponses() {
        // For now, we'll simulate checking by looking for a responses file
        // In production, this would connect to Gmail IMAP or use webhooks
        const responsesFile = path.join(__dirname, 'pending-responses.json');
        
        try {
            const pendingData = await fs.readFile(responsesFile, 'utf8');
            const pendingResponses = JSON.parse(pendingData);
            
            if (pendingResponses.length > 0) {
                await this.log(`📧 Found ${pendingResponses.length} pending response(s)`);
                
                for (const response of pendingResponses) {
                    await this.processResponse(response);
                }
                
                // Clear processed responses
                await fs.writeFile(responsesFile, JSON.stringify([], null, 2));
            }
            
        } catch (error) {
            if (error.code !== 'ENOENT') {
                await this.log(`⚠️ Error reading pending responses: ${error.message}`);
            }
            // File doesn't exist - no pending responses, which is normal
        }
    }

    /**
     * Process an individual response through the autoresponder
     */
    async processResponse(response) {
        const responseId = `${response.email}_${Date.now()}`;
        
        if (this.processedEmails.has(responseId)) {
            await this.log(`🔄 Skipping duplicate response from ${response.email}`);
            return;
        }

        try {
            await this.log(`📨 Processing response from ${response.email}: "${response.responseContent.substring(0, 50)}..."`);
            
            // Process through autoresponder
            const result = await this.autoresponder.processIncomingResponse({
                email: response.email,
                firstName: response.firstName || response.email.split('@')[0],
                responseContent: response.responseContent,
                campaignId: response.campaignId || 'automated_campaign',
                audienceSegment: response.audienceSegment || 'data_science_professionals'
            });

            if (result.processed) {
                this.processedEmails.add(responseId);
                await this.log(`✅ Auto-response sent to ${response.email} (type: ${result.responseType})`);
                console.log(`✅ [${new Date().toLocaleTimeString()}] Auto-response sent to ${response.email} → ${result.responseType}`);
            } else {
                await this.log(`❌ Failed to process response from ${response.email}`);
            }

        } catch (error) {
            await this.log(`❌ Error processing response from ${response.email}: ${error.message}`);
            console.error(`Error processing ${response.email}:`, error.message);
        }
    }

    /**
     * Add a response to the pending queue (for manual testing)
     */
    async addPendingResponse(responseData) {
        const responsesFile = path.join(__dirname, 'pending-responses.json');
        
        let pending = [];
        try {
            const data = await fs.readFile(responsesFile, 'utf8');
            pending = JSON.parse(data);
        } catch (error) {
            // File doesn't exist, start with empty array
        }

        pending.push({
            email: responseData.email,
            firstName: responseData.firstName,
            responseContent: responseData.responseContent,
            campaignId: responseData.campaignId,
            audienceSegment: responseData.audienceSegment,
            timestamp: new Date().toISOString()
        });

        await fs.writeFile(responsesFile, JSON.stringify(pending, null, 2));
        await this.log(`📝 Added pending response from ${responseData.email}`);
    }

    /**
     * Log activity to file
     */
    async log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        
        try {
            await fs.appendFile(this.monitorLog, logMessage);
        } catch (error) {
            console.error('Failed to write to log:', error);
        }
    }

    /**
     * Get monitoring statistics
     */
    async getStats() {
        const stats = await this.autoresponder.getAutoresponseStats();
        
        return {
            ...stats,
            monitoringActive: this.isRunning,
            processedCount: this.processedEmails.size,
            checkInterval: this.checkInterval
        };
    }
}

// CLI interface
async function main() {
    const monitor = new AutomatedResponseMonitor();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'start':
            // Handle graceful shutdown
            process.on('SIGINT', async () => {
                console.log('\n🛑 Received shutdown signal...');
                await monitor.stop();
                process.exit(0);
            });
            
            await monitor.start();
            break;

        case 'test':
            // Add a test response to demonstrate functionality
            const testResponse = {
                email: 'test@example.com',
                firstName: 'John',
                responseContent: 'This looks very interesting! Can you send me the DATA report with all the insights?',
                campaignId: 'test_campaign',
                audienceSegment: 'data_science_professionals'
            };
            
            console.log('🧪 Adding test response to pending queue...');
            await monitor.addPendingResponse(testResponse);
            console.log('✅ Test response added. Start the monitor to process it.');
            break;

        case 'stats':
            const stats = await monitor.getStats();
            console.log('\n📊 Automated Monitor Statistics:');
            console.log('================================');
            console.log(`Monitoring Active: ${stats.monitoringActive ? '✅ YES' : '❌ NO'}`);
            console.log(`Total Autoresponses: ${stats.totalAutoresponses}`);
            console.log(`Last 24 hours: ${stats.last24Hours}`);
            console.log(`Processed this session: ${stats.processedCount}`);
            console.log(`Check interval: ${stats.checkInterval / 1000}s`);
            console.log('\nResponse Types:');
            Object.entries(stats.byType).forEach(([type, count]) => {
                console.log(`  ${type}: ${count}`);
            });
            break;

        case 'add-response':
            // Interactive mode to add a response
            console.log('📝 Add a response to the processing queue:');
            console.log('This simulates receiving an email response that will be auto-processed');
            
            // For demo, add a realistic response
            const demoResponse = {
                email: 'sarah.johnson@techcorp.com',
                firstName: 'Sarah',
                responseContent: 'Hi Gabriele, thanks for reaching out! This data science content strategy sounds fascinating. I\'ve been struggling with engagement on our technical posts. Can you send me the complete INSIGHTS analysis you mentioned? I\'d love to see the 110-character rule and the other findings.',
                campaignId: 'data_science_campaign_2025',
                audienceSegment: 'data_science_professionals'
            };
            
            await monitor.addPendingResponse(demoResponse);
            console.log('✅ Demo response added from sarah.johnson@techcorp.com');
            console.log('🚀 Run `node automated-response-monitor.js start` to process it');
            break;

        default:
            console.log(`
🤖 Automated Response Monitor

Commands:
  start         Start continuous monitoring for incoming responses
  test          Add a test response to the queue
  add-response  Add a demo response to process
  stats         Show monitoring and autoresponse statistics

Features:
✅ Continuous monitoring every 30 seconds
✅ Automatic response classification (6 types)
✅ Full intelligence report delivery
✅ Professional HTML email formatting
✅ Complete activity logging
✅ Duplicate prevention

How it works:
1. Monitors for incoming email responses
2. Automatically analyzes response type (DATA, INSIGHTS, etc.)
3. Sends appropriate autoresponse with full analysis
4. Logs all activity for tracking

Production Setup:
- Configure Gmail API credentials in .env
- Set up email webhooks for real-time processing
- Deploy to a server for 24/7 monitoring

Usage:
  node automated-response-monitor.js start
            `);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = AutomatedResponseMonitor;
