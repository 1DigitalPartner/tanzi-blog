#!/usr/bin/env node

/**
 * TanziTech Lead Alert System
 * Monitors campaign performance and sends alerts for new leads and engagement milestones
 */

const fs = require('fs').promises;
const path = require('path');

class LeadAlertSystem {
    constructor() {
        this.alertConfig = {
            engagementThresholds: {
                linkedin: { low: 50, medium: 100, high: 200 },
                reddit: { low: 100, medium: 200, high: 400 },
                hackernews: { low: 80, medium: 150, high: 300 },
                twitter: { low: 20, medium: 50, high: 100 }
            },
            checkInterval: 10 * 60 * 1000, // 10 minutes
            alertTypes: {
                NEW_LEAD: 'New qualified lead detected',
                HIGH_ENGAGEMENT: 'Post reached high engagement threshold',
                CAMPAIGN_MILESTONE: 'Campaign milestone achieved',
                RESPONSE_NEEDED: 'User requesting promised resources'
            }
        };

        this.lastKnownState = {
            linkedin: 0,
            reddit: 0,
            leads: 0,
            lastCheck: new Date().toISOString()
        };

        this.alertHistory = [];
        this.isMonitoring = false;
    }

    /**
     * Start the alert monitoring system
     */
    async startMonitoring() {
        console.log('🚨 TanziTech Lead Alert System Started');
        console.log('═══════════════════════════════════════');
        console.log(`⏰ Checking every ${this.alertConfig.checkInterval / 1000 / 60} minutes`);
        console.log('🎯 Monitoring for:');
        console.log('   • New lead requests ("PLAYBOOK", research reports)');
        console.log('   • Engagement milestone breakthroughs');  
        console.log('   • High-priority comment responses needed');
        console.log('   • Campaign performance alerts');
        console.log('');

        this.isMonitoring = true;

        // Initial state capture
        await this.captureBaselineState();

        // Start monitoring loop
        this.monitoringInterval = setInterval(async () => {
            if (this.isMonitoring) {
                await this.runAlertCheck();
            }
        }, this.alertConfig.checkInterval);

        // Also run immediate check
        await this.runAlertCheck();

        console.log('✅ Alert system is now active and monitoring...');
        return { status: 'active', message: 'Lead alert system started successfully' };
    }

    /**
     * Stop the monitoring system
     */
    stopMonitoring() {
        this.isMonitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        console.log('⏹️ Lead alert system stopped');
    }

    /**
     * Capture current campaign state as baseline
     */
    async captureBaselineState() {
        try {
            // Get current crosspost metrics
            const metricsPath = path.join(__dirname, 'crosspost-metrics.json');
            const metricsData = await fs.readFile(metricsPath, 'utf8');
            const metrics = JSON.parse(metricsData);

            // Find today's lead generation posts
            const today = new Date().toDateString();
            const leadPosts = {
                linkedin: 0,
                reddit: 0
            };

            // LinkedIn lead posts
            const linkedinLeadPosts = metrics.platforms.linkedin.posts.filter(post => {
                const postDate = new Date(post.publishedDate).toDateString();
                return postDate === today && post.category === 'lead_generation';
            });

            // Reddit lead posts  
            const redditLeadPosts = metrics.platforms.reddit.posts.filter(post => {
                const postDate = new Date(post.publishedDate).toDateString();
                return postDate === today && post.category === 'lead_generation';
            });

            if (linkedinLeadPosts.length > 0) {
                leadPosts.linkedin = linkedinLeadPosts[0].engagement || 0;
            }

            if (redditLeadPosts.length > 0) {
                leadPosts.reddit = redditLeadPosts[0].engagement || 0;
            }

            this.lastKnownState = {
                linkedin: leadPosts.linkedin,
                reddit: leadPosts.reddit,
                leads: 0,
                lastCheck: new Date().toISOString()
            };

            console.log('📊 Baseline State Captured:');
            console.log(`   LinkedIn: ${leadPosts.linkedin} engagement`);
            console.log(`   Reddit: ${leadPosts.reddit} engagement`);
            console.log('');

        } catch (error) {
            console.error('⚠️ Error capturing baseline state:', error.message);
        }
    }

    /**
     * Run alert check cycle
     */
    async runAlertCheck() {
        const checkTime = new Date().toISOString();
        console.log(`🔍 Running alert check at ${new Date().toLocaleTimeString()}...`);

        try {
            // Check engagement changes
            await this.checkEngagementAlerts();

            // Check for new leads
            await this.checkNewLeads();

            // Check campaign milestones
            await this.checkCampaignMilestones();

            // Update last check time
            this.lastKnownState.lastCheck = checkTime;

            console.log('✅ Alert check completed');

        } catch (error) {
            console.error('❌ Alert check failed:', error.message);
            this.sendAlert('SYSTEM_ERROR', `Alert system error: ${error.message}`);
        }
    }

    /**
     * Check for engagement threshold alerts
     */
    async checkEngagementAlerts() {
        try {
            // Get current metrics
            const metricsPath = path.join(__dirname, 'crosspost-metrics.json');
            const metricsData = await fs.readFile(metricsPath, 'utf8');
            const metrics = JSON.parse(metricsData);

            const today = new Date().toDateString();
            
            // Check LinkedIn lead posts
            const linkedinLeadPosts = metrics.platforms.linkedin.posts.filter(post => {
                const postDate = new Date(post.publishedDate).toDateString();
                return postDate === today && post.category === 'lead_generation';
            });

            // Check Reddit lead posts
            const redditLeadPosts = metrics.platforms.reddit.posts.filter(post => {
                const postDate = new Date(post.publishedDate).toDateString();
                return postDate === today && post.category === 'lead_generation';
            });

            // LinkedIn alerts
            if (linkedinLeadPosts.length > 0) {
                const currentEngagement = linkedinLeadPosts[0].engagement || 0;
                const previousEngagement = this.lastKnownState.linkedin;
                
                if (currentEngagement > previousEngagement) {
                    const growth = currentEngagement - previousEngagement;
                    this.checkEngagementThreshold('linkedin', currentEngagement, growth);
                    this.lastKnownState.linkedin = currentEngagement;
                }
            }

            // Reddit alerts  
            if (redditLeadPosts.length > 0) {
                const currentEngagement = redditLeadPosts[0].engagement || 0;
                const previousEngagement = this.lastKnownState.reddit;
                
                if (currentEngagement > previousEngagement) {
                    const growth = currentEngagement - previousEngagement;
                    this.checkEngagementThreshold('reddit', currentEngagement, growth);
                    this.lastKnownState.reddit = currentEngagement;
                }
            }

        } catch (error) {
            console.error('⚠️ Error checking engagement alerts:', error.message);
        }
    }

    /**
     * Check if engagement crossed threshold
     */
    checkEngagementThreshold(platform, engagement, growth) {
        const thresholds = this.alertConfig.engagementThresholds[platform];
        
        if (engagement >= thresholds.high) {
            this.sendAlert('HIGH_ENGAGEMENT', 
                `🔥 ${platform.toUpperCase()} POST VIRAL! ${engagement} engagement (+${growth}) - This is performing exceptionally well!`
            );
        } else if (engagement >= thresholds.medium) {
            this.sendAlert('MEDIUM_ENGAGEMENT',
                `📈 ${platform.toUpperCase()} post gaining momentum: ${engagement} engagement (+${growth}) - Great performance!`
            );
        } else if (growth >= 20) {
            this.sendAlert('ENGAGEMENT_GROWTH',
                `📊 ${platform.toUpperCase()} post: ${engagement} engagement (+${growth}) - Strong growth trend!`
            );
        }
    }

    /**
     * Check for new leads in comments or responses
     */
    async checkNewLeads() {
        try {
            // Check if leads database exists
            const leadsPath = path.join(__dirname, 'leads-database.json');
            
            try {
                const leadsData = await fs.readFile(leadsPath, 'utf8');
                const leads = JSON.parse(leadsData);
                
                const currentLeadCount = leads.leads ? leads.leads.length : 0;
                const previousLeadCount = this.lastKnownState.leads;
                
                if (currentLeadCount > previousLeadCount) {
                    const newLeads = currentLeadCount - previousLeadCount;
                    this.sendAlert('NEW_LEAD', 
                        `🎉 NEW LEADS DETECTED! ${newLeads} new qualified leads captured. Total: ${currentLeadCount}`
                    );
                    this.lastKnownState.leads = currentLeadCount;
                }
                
            } catch (error) {
                // No leads database yet - this is normal for new campaigns
            }

        } catch (error) {
            console.error('⚠️ Error checking new leads:', error.message);
        }
    }

    /**
     * Check campaign milestones
     */
    async checkCampaignMilestones() {
        const totalEngagement = this.lastKnownState.linkedin + this.lastKnownState.reddit;
        
        // Milestone alerts
        if (totalEngagement >= 500 && !this.hasAlerted('MILESTONE_500')) {
            this.sendAlert('CAMPAIGN_MILESTONE',
                `🎯 MILESTONE: Total campaign engagement reached 500! (LinkedIn: ${this.lastKnownState.linkedin}, Reddit: ${this.lastKnownState.reddit})`
            );
        }
        
        if (totalEngagement >= 200 && !this.hasAlerted('MILESTONE_200')) {
            this.sendAlert('CAMPAIGN_MILESTONE',
                `🚀 MILESTONE: Total campaign engagement reached 200! Strong early performance.`
            );
        }

        if (totalEngagement >= 100 && !this.hasAlerted('MILESTONE_100')) {
            this.sendAlert('CAMPAIGN_MILESTONE',
                `✨ MILESTONE: Total campaign engagement reached 100! Campaign is gaining traction.`
            );
        }
    }

    /**
     * Send alert notification
     */
    sendAlert(type, message) {
        const alert = {
            id: `alert_${Date.now()}`,
            type,
            message,
            timestamp: new Date().toISOString(),
            acknowledged: false
        };

        this.alertHistory.push(alert);

        // Console notification
        console.log('');
        console.log('🚨 ═══════════ ALERT ═══════════');
        console.log(`📅 ${new Date().toLocaleString()}`);
        console.log(`🏷️  ${type}`);
        console.log(`💬 ${message}`);
        console.log('════════════════════════════════════');
        console.log('');

        // Save alert to file for persistence
        this.saveAlertsToFile();

        // You could add email/SMS notifications here
        // this.sendEmailAlert(alert);
        // this.sendSlackAlert(alert);
    }

    /**
     * Check if we've already sent this type of alert
     */
    hasAlerted(alertKey) {
        return this.alertHistory.some(alert => 
            alert.message.includes(alertKey) || alert.id.includes(alertKey)
        );
    }

    /**
     * Save alerts to file
     */
    async saveAlertsToFile() {
        try {
            const alertsPath = path.join(__dirname, 'campaign-alerts.json');
            const alertsData = {
                generated: new Date().toISOString(),
                totalAlerts: this.alertHistory.length,
                alerts: this.alertHistory,
                lastKnownState: this.lastKnownState,
                isMonitoring: this.isMonitoring
            };

            await fs.writeFile(alertsPath, JSON.stringify(alertsData, null, 2));
        } catch (error) {
            console.error('⚠️ Error saving alerts to file:', error.message);
        }
    }

    /**
     * Get alert summary
     */
    getAlertSummary() {
        const recentAlerts = this.alertHistory.filter(alert => {
            const alertTime = new Date(alert.timestamp);
            const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
            return alertTime > hourAgo;
        });

        return {
            totalAlerts: this.alertHistory.length,
            recentAlerts: recentAlerts.length,
            currentState: this.lastKnownState,
            isMonitoring: this.isMonitoring,
            alerts: this.alertHistory.slice(-10) // Last 10 alerts
        };
    }
}

// Command line interface
async function main() {
    const alertSystem = new LeadAlertSystem();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'start':
            await alertSystem.startMonitoring();
            break;
            
        case 'stop':
            alertSystem.stopMonitoring();
            break;
            
        case 'status':
            const summary = alertSystem.getAlertSummary();
            console.log('📊 Alert System Status:');
            console.log(JSON.stringify(summary, null, 2));
            break;
            
        case 'test':
            alertSystem.sendAlert('TEST', 'This is a test alert to verify the system is working');
            break;
            
        default:
            console.log('TanziTech Lead Alert System');
            console.log('Usage:');
            console.log('  node lead-alert-system.js start   - Start monitoring');
            console.log('  node lead-alert-system.js stop    - Stop monitoring');
            console.log('  node lead-alert-system.js status  - Show current status');
            console.log('  node lead-alert-system.js test    - Send test alert');
            break;
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = LeadAlertSystem;
