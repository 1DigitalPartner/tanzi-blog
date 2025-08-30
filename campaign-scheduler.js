#!/usr/bin/env node

/**
 * Campaign Scheduler - Professional Email Campaign Management
 * Handles Gmail rate limit recovery and optimal campaign timing
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

class CampaignScheduler {
    constructor() {
        this.campaignLog = path.join(__dirname, 'campaign-schedule.json');
        this.rateLimit = {
            lastAttempt: null,
            cooldownHours: 48,
            productionBatchSize: 25,
            productionDelay: 900000 // 15 minutes
        };
    }

    /**
     * Check if Gmail rate limit cooldown period has passed
     */
    async checkRateLimitStatus() {
        try {
            const logData = await fs.readFile(this.campaignLog, 'utf8');
            const log = JSON.parse(logData);
            
            if (log.lastRateLimitHit) {
                const lastHit = new Date(log.lastRateLimitHit);
                const now = new Date();
                const hoursPassed = (now - lastHit) / (1000 * 60 * 60);
                
                return {
                    rateLimitActive: hoursPassed < this.rateLimit.cooldownHours,
                    hoursPassed: Math.floor(hoursPassed),
                    hoursRemaining: Math.max(0, this.rateLimit.cooldownHours - Math.floor(hoursPassed)),
                    readyTime: new Date(lastHit.getTime() + (this.rateLimit.cooldownHours * 60 * 60 * 1000))
                };
            }
        } catch (error) {
            // No log exists, assume we can proceed
        }

        return {
            rateLimitActive: false,
            hoursPassed: 48,
            hoursRemaining: 0,
            readyTime: new Date()
        };
    }

    /**
     * Log rate limit event
     */
    async logRateLimitEvent() {
        const logEntry = {
            lastRateLimitHit: new Date().toISOString(),
            event: 'Gmail rate limit triggered',
            action: 'Campaign paused for professional compliance',
            nextRecommendedLaunch: new Date(Date.now() + (48 * 60 * 60 * 1000)).toISOString()
        };

        await fs.writeFile(this.campaignLog, JSON.stringify(logEntry, null, 2));
    }

    /**
     * Calculate optimal campaign timeline
     */
    calculateCampaignTimeline(totalEmails) {
        const batchSize = this.rateLimit.productionBatchSize;
        const delayMinutes = this.rateLimit.productionDelay / (1000 * 60);
        const totalBatches = Math.ceil(totalEmails / batchSize);
        const totalMinutes = totalBatches * delayMinutes;
        const totalDays = Math.ceil(totalMinutes / (60 * 24));

        return {
            totalEmails,
            batchSize,
            totalBatches,
            delayBetweenBatches: `${delayMinutes} minutes`,
            estimatedDays: totalDays,
            emailsPerDay: Math.ceil(totalEmails / totalDays),
            startTime: new Date(),
            estimatedCompletion: new Date(Date.now() + (totalMinutes * 60 * 1000))
        };
    }

    /**
     * Check campaign readiness and provide status
     */
    async getCampaignStatus() {
        const rateLimitStatus = await this.checkRateLimitStatus();
        const timeline = this.calculateCampaignTimeline(42633);

        console.log('🚀 TanziTech Professional Email Campaign Status');
        console.log('═══════════════════════════════════════════════\n');

        console.log('📧 Campaign Details:');
        console.log(`   • Email List: ${timeline.totalEmails.toLocaleString()} contacts`);
        console.log(`   • Template: Social Media Awareness`);
        console.log(`   • From: tanzidigitalpartner@gmail.com`);
        console.log(`   • Professional Rate: ${timeline.batchSize} emails every ${timeline.delayBetweenBatches}\n`);

        console.log('⏱️  Timeline Projection:');
        console.log(`   • Total Batches: ${timeline.totalBatches.toLocaleString()}`);
        console.log(`   • Estimated Duration: ${timeline.estimatedDays} days`);
        console.log(`   • Daily Volume: ~${timeline.emailsPerDay} emails/day`);
        console.log(`   • Expected Completion: ${timeline.estimatedCompletion.toLocaleDateString()}\n`);

        if (rateLimitStatus.rateLimitActive) {
            console.log('⚠️  Gmail Rate Limit Status:');
            console.log(`   • Status: Cooldown period active`);
            console.log(`   • Hours passed: ${rateLimitStatus.hoursPassed}/48`);
            console.log(`   • Hours remaining: ${rateLimitStatus.hoursRemaining}`);
            console.log(`   • Ready to launch: ${rateLimitStatus.readyTime.toLocaleString()}\n`);
            
            console.log('💡 Recommendation:');
            console.log(`   Wait ${rateLimitStatus.hoursRemaining} hours for optimal deliverability`);
            console.log('   This ensures maximum Gmail compliance and engagement rates\n');
        } else {
            console.log('✅ Gmail Rate Limit Status:');
            console.log('   • Status: Ready for professional launch');
            console.log('   • Cooldown period: Completed');
            console.log('   • Launch recommendation: Proceed immediately\n');
            
            console.log('🚀 Ready to Launch:');
            console.log('   node bulk-email-campaign.js launch social_media_campaign social_media_awareness\n');
        }

        console.log('📈 Expected Campaign Results:');
        console.log('   • Response Rate: 12-15%');
        console.log(`   • Expected Leads: ${Math.floor(timeline.totalEmails * 0.12).toLocaleString()} - ${Math.floor(timeline.totalEmails * 0.15).toLocaleString()}`);
        console.log('   • Professional Deliverability: 95%+');
        console.log('   • Combined with Social Media: 700+ total leads\n');

        return {
            rateLimitStatus,
            timeline,
            readyToLaunch: !rateLimitStatus.rateLimitActive
        };
    }

    /**
     * Monitor campaign progress
     */
    async monitorCampaign() {
        console.log('📊 Campaign Monitor - Real-time Status');
        console.log('════════════════════════════════════════\n');

        try {
            // Check for email send logs
            const logPath = path.join(__dirname, 'email-send-log.json');
            const logData = await fs.readFile(logPath, 'utf8');
            const logs = JSON.parse(logData);
            
            const today = new Date().toDateString();
            const todayLogs = logs.filter(log => 
                new Date(log.timestamp).toDateString() === today
            );
            
            const successToday = todayLogs.filter(log => log.status === 'sent').length;
            const failedToday = todayLogs.filter(log => log.status === 'failed').length;
            
            console.log('📈 Today\'s Performance:');
            console.log(`   • Emails sent: ${successToday}`);
            console.log(`   • Failed sends: ${failedToday}`);
            console.log(`   • Success rate: ${((successToday / (successToday + failedToday)) * 100).toFixed(1)}%\n`);
            
            // Recent activity
            const recentLogs = logs.slice(-10);
            console.log('🕐 Recent Activity:');
            recentLogs.forEach(log => {
                const time = new Date(log.timestamp).toLocaleTimeString();
                const status = log.status === 'sent' ? '✅' : '❌';
                console.log(`   ${status} ${time}: ${log.email}`);
            });
            
        } catch (error) {
            console.log('📋 No campaign activity detected yet\n');
            console.log('💡 To start monitoring, launch your campaign first:');
            console.log('   node bulk-email-campaign.js launch social_media_campaign social_media_awareness\n');
        }
    }
}

// CLI usage
if (require.main === module) {
    const scheduler = new CampaignScheduler();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'status':
            scheduler.getCampaignStatus();
            break;
        case 'monitor':
            scheduler.monitorCampaign();
            break;
        case 'log-rate-limit':
            scheduler.logRateLimitEvent().then(() => {
                console.log('✅ Rate limit event logged - 48 hour cooldown period started');
            });
            break;
        default:
            console.log(`
🚀 TanziTech Campaign Scheduler

Commands:
  status     Check campaign readiness and Gmail rate limit status
  monitor    Monitor active campaign performance  
  log-rate-limit    Log rate limit event (for system use)

Examples:
  node campaign-scheduler.js status
  node campaign-scheduler.js monitor
            `);
    }
}

module.exports = CampaignScheduler;
