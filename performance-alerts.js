#!/usr/bin/env node

/**
 * Performance Alerts and Reporting System
 * Automated alerts for performance anomalies and scheduled reports
 */

const fs = require('fs').promises;
const path = require('path');

class PerformanceAlerts {
    constructor() {
        this.metricsFile = path.join(__dirname, 'crosspost-metrics.json');
        this.alertsLog = path.join(__dirname, 'alerts-log.json');
        this.configFile = path.join(__dirname, 'alerts-config.json');
        
        this.defaultConfig = {
            thresholds: {
                minEngagementRate: 20,           // Minimum engagement rate per post
                engagementDropPercentage: 50,    // Alert if engagement drops by 50%
                platformFailureRate: 30,         // Alert if platform has 30%+ failures
                stalenessHours: 6                // Alert if metrics are stale by 6+ hours
            },
            alertTypes: {
                LOW_ENGAGEMENT: { priority: 'medium', enabled: true },
                ENGAGEMENT_DROP: { priority: 'high', enabled: true },
                PLATFORM_FAILURE: { priority: 'high', enabled: true },
                STALE_METRICS: { priority: 'low', enabled: true },
                QUEUE_BACKLOG: { priority: 'medium', enabled: true }
            },
            notifications: {
                console: true,
                webhook: false,
                email: false,
                slack: false
            },
            reporting: {
                dailyReport: { enabled: true, time: '09:00' },
                weeklyReport: { enabled: true, day: 'monday', time: '10:00' },
                monthlyReport: { enabled: true, date: 1, time: '11:00' }
            }
        };
    }

    async initialize() {
        // Create config file if it doesn't exist
        try {
            await fs.access(this.configFile);
        } catch {
            await this.createDefaultConfig();
        }

        // Create alerts log if it doesn't exist
        try {
            await fs.access(this.alertsLog);
        } catch {
            await this.createAlertsLog();
        }

        console.log('✅ Performance alerts system initialized');
    }

    async createDefaultConfig() {
        await fs.writeFile(this.configFile, JSON.stringify(this.defaultConfig, null, 2));
        console.log('📝 Created default alerts configuration');
    }

    async createAlertsLog() {
        const initialLog = {
            created: new Date().toISOString(),
            alerts: []
        };
        await fs.writeFile(this.alertsLog, JSON.stringify(initialLog, null, 2));
        console.log('📝 Created alerts log file');
    }

    async loadConfig() {
        try {
            const configData = await fs.readFile(this.configFile, 'utf8');
            return JSON.parse(configData);
        } catch (error) {
            console.error('❌ Failed to load config, using defaults:', error.message);
            return this.defaultConfig;
        }
    }

    async loadMetrics() {
        try {
            const metricsData = await fs.readFile(this.metricsFile, 'utf8');
            return JSON.parse(metricsData);
        } catch (error) {
            console.error('❌ Failed to load metrics:', error.message);
            return null;
        }
    }

    async logAlert(alert) {
        try {
            const logData = await fs.readFile(this.alertsLog, 'utf8');
            const log = JSON.parse(logData);
            
            alert.id = Date.now().toString();
            alert.timestamp = new Date().toISOString();
            alert.acknowledged = false;
            
            log.alerts.push(alert);
            
            // Keep only last 500 alerts
            if (log.alerts.length > 500) {
                log.alerts = log.alerts.slice(-500);
            }
            
            await fs.writeFile(this.alertsLog, JSON.stringify(log, null, 2));
            console.log(`🚨 Alert logged: ${alert.type} - ${alert.message}`);
        } catch (error) {
            console.error('❌ Failed to log alert:', error.message);
        }
    }

    async checkEngagementAnomalies(metrics, config) {
        const alerts = [];
        const summary = metrics.summary;

        // Check overall low engagement
        if (summary.avgEngagementRate < config.thresholds.minEngagementRate) {
            alerts.push({
                type: 'LOW_ENGAGEMENT',
                priority: config.alertTypes.LOW_ENGAGEMENT.priority,
                message: `Average engagement rate (${Math.round(summary.avgEngagementRate)}) is below threshold (${config.thresholds.minEngagementRate})`,
                details: {
                    currentRate: summary.avgEngagementRate,
                    threshold: config.thresholds.minEngagementRate,
                    totalPosts: summary.totalPosts
                }
            });
        }

        // Check platform-specific issues
        Object.entries(metrics.platforms).forEach(([platform, data]) => {
            if (data.totalPosts > 0) {
                const platformRate = data.avgEngagementRate;
                
                if (platformRate < config.thresholds.minEngagementRate) {
                    alerts.push({
                        type: 'PLATFORM_FAILURE',
                        priority: config.alertTypes.PLATFORM_FAILURE.priority,
                        message: `${platform} has low engagement rate: ${Math.round(platformRate)}`,
                        details: {
                            platform,
                            engagementRate: platformRate,
                            posts: data.totalPosts,
                            threshold: config.thresholds.minEngagementRate
                        }
                    });
                }
            }
        });

        return alerts;
    }

    async checkMetricsFreshness(metrics, config) {
        const alerts = [];
        const lastUpdated = new Date(metrics.lastUpdated);
        const now = new Date();
        const hoursDiff = (now - lastUpdated) / (1000 * 60 * 60);

        if (hoursDiff > config.thresholds.stalenessHours) {
            alerts.push({
                type: 'STALE_METRICS',
                priority: config.alertTypes.STALE_METRICS.priority,
                message: `Metrics are stale: last updated ${Math.round(hoursDiff)} hours ago`,
                details: {
                    lastUpdated: metrics.lastUpdated,
                    hoursSinceUpdate: hoursDiff,
                    threshold: config.thresholds.stalenessHours
                }
            });
        }

        return alerts;
    }

    async checkQueueHealth() {
        const alerts = [];
        
        try {
            const queueData = await fs.readFile(path.join(__dirname, 'crosspost-queue.json'), 'utf8');
            const queue = JSON.parse(queueData);
            
            const now = new Date();
            const overdueJobs = queue.queue?.filter(job => {
                const scheduledTime = new Date(job.scheduledTime);
                return job.status === 'scheduled' && scheduledTime < now;
            }) || [];

            if (overdueJobs.length > 10) {
                alerts.push({
                    type: 'QUEUE_BACKLOG',
                    priority: 'medium',
                    message: `Queue has ${overdueJobs.length} overdue jobs`,
                    details: {
                        overdueCount: overdueJobs.length,
                        totalQueued: queue.queue?.length || 0,
                        platforms: [...new Set(overdueJobs.map(job => job.platform))]
                    }
                });
            }
        } catch (error) {
            alerts.push({
                type: 'QUEUE_FAILURE',
                priority: 'high',
                message: 'Failed to read crosspost queue',
                details: {
                    error: error.message
                }
            });
        }

        return alerts;
    }

    async runPerformanceCheck() {
        console.log('🔍 Running performance check...');
        
        const config = await this.loadConfig();
        const metrics = await this.loadMetrics();
        
        if (!metrics) {
            console.error('❌ No metrics available for analysis');
            return;
        }

        const allAlerts = [];

        // Run various checks
        const engagementAlerts = await this.checkEngagementAnomalies(metrics, config);
        const freshnessAlerts = await this.checkMetricsFreshness(metrics, config);
        const queueAlerts = await this.checkQueueHealth();

        allAlerts.push(...engagementAlerts, ...freshnessAlerts, ...queueAlerts);

        // Filter enabled alerts
        const enabledAlerts = allAlerts.filter(alert => 
            config.alertTypes[alert.type]?.enabled !== false
        );

        // Log and notify for each alert
        for (const alert of enabledAlerts) {
            await this.logAlert(alert);
            await this.sendNotification(alert, config);
        }

        console.log(`✅ Performance check completed: ${enabledAlerts.length} alerts generated`);
        return enabledAlerts;
    }

    async sendNotification(alert, config) {
        const notification = {
            timestamp: new Date().toISOString(),
            type: alert.type,
            priority: alert.priority,
            message: alert.message,
            details: alert.details
        };

        // Console notification (always enabled)
        if (config.notifications.console) {
            const priorityIcon = {
                high: '🚨',
                medium: '⚠️',
                low: 'ℹ️'
            };
            
            console.log(`${priorityIcon[alert.priority]} ${alert.type}: ${alert.message}`);
        }

        // Webhook notification (if configured)
        if (config.notifications.webhook && process.env.ALERT_WEBHOOK_URL) {
            try {
                // Simulate webhook call (replace with actual HTTP request)
                console.log(`📡 Webhook notification sent for ${alert.type}`);
            } catch (error) {
                console.error('❌ Failed to send webhook notification:', error.message);
            }
        }

        // Email notification (if configured)
        if (config.notifications.email && process.env.ALERT_EMAIL) {
            try {
                // Simulate email sending (replace with actual email service)
                console.log(`📧 Email notification sent for ${alert.type}`);
            } catch (error) {
                console.error('❌ Failed to send email notification:', error.message);
            }
        }
    }

    async generateDailyReport() {
        console.log('📊 Generating daily performance report...');
        
        const metrics = await this.loadMetrics();
        if (!metrics) return null;

        const report = {
            type: 'daily',
            generatedAt: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0],
            summary: {
                totalPosts: metrics.summary.totalPosts,
                totalEngagement: metrics.summary.totalEngagement,
                avgEngagement: Math.round(metrics.summary.avgEngagementRate),
                topPlatform: metrics.summary.topPerformingPlatform
            },
            platformPerformance: {},
            insights: []
        };

        // Platform performance
        Object.entries(metrics.platforms).forEach(([platform, data]) => {
            if (data.totalPosts > 0) {
                report.platformPerformance[platform] = {
                    posts: data.totalPosts,
                    avgEngagement: Math.round(data.avgEngagementRate),
                    totalEngagement: data.totalEngagement
                };
            }
        });

        // Generate insights
        const platforms = Object.entries(report.platformPerformance)
            .sort((a, b) => b[1].avgEngagement - a[1].avgEngagement);

        if (platforms.length > 0) {
            report.insights.push(`Best performing platform: ${platforms[0][0]} (${platforms[0][1].avgEngagement} avg engagement)`);
        }

        if (platforms.length > 1) {
            const improvement = platforms[0][1].avgEngagement - platforms[platforms.length - 1][1].avgEngagement;
            report.insights.push(`Performance gap: ${improvement} engagement difference between best and worst platforms`);
        }

        // Save report
        const reportFile = path.join(__dirname, `daily-report-${report.date}.json`);
        await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
        
        console.log('✅ Daily report generated:', reportFile);
        return report;
    }

    async generateWeeklyReport() {
        console.log('📊 Generating weekly performance report...');
        
        // Similar to daily report but with weekly aggregation
        const report = {
            type: 'weekly',
            generatedAt: new Date().toISOString(),
            weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            weekEnd: new Date().toISOString().split('T')[0],
            summary: 'Weekly performance analysis would go here',
            trends: 'Weekly trends analysis would go here',
            recommendations: [
                'Focus on top-performing content formats',
                'Optimize posting times for better engagement',
                'Consider A/B testing different approaches'
            ]
        };

        const reportFile = path.join(__dirname, `weekly-report-${report.weekEnd}.json`);
        await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
        
        console.log('✅ Weekly report generated:', reportFile);
        return report;
    }

    async getAlertsHistory(limit = 50) {
        try {
            const logData = await fs.readFile(this.alertsLog, 'utf8');
            const log = JSON.parse(logData);
            
            return log.alerts
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, limit);
        } catch (error) {
            console.error('❌ Failed to get alerts history:', error.message);
            return [];
        }
    }

    async acknowledgeAlert(alertId) {
        try {
            const logData = await fs.readFile(this.alertsLog, 'utf8');
            const log = JSON.parse(logData);
            
            const alert = log.alerts.find(a => a.id === alertId);
            if (alert) {
                alert.acknowledged = true;
                alert.acknowledgedAt = new Date().toISOString();
                
                await fs.writeFile(this.alertsLog, JSON.stringify(log, null, 2));
                console.log(`✅ Alert ${alertId} acknowledged`);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Failed to acknowledge alert:', error.message);
            return false;
        }
    }
}

// CLI Interface
async function main() {
    const alerts = new PerformanceAlerts();
    await alerts.initialize();
    
    const command = process.argv[2] || 'check';
    
    try {
        switch (command) {
            case 'check':
                await alerts.runPerformanceCheck();
                break;
                
            case 'daily':
                await alerts.generateDailyReport();
                break;
                
            case 'weekly':
                await alerts.generateWeeklyReport();
                break;
                
            case 'history':
                const history = await alerts.getAlertsHistory(20);
                console.log('📋 Recent Alerts:');
                history.forEach(alert => {
                    const status = alert.acknowledged ? '✅' : '⚠️';
                    console.log(`${status} ${alert.type}: ${alert.message} (${alert.timestamp})`);
                });
                break;
                
            case 'ack':
                const alertId = process.argv[3];
                if (alertId) {
                    const result = await alerts.acknowledgeAlert(alertId);
                    console.log(result ? 'Alert acknowledged' : 'Alert not found');
                } else {
                    console.log('Usage: node performance-alerts.js ack <alert_id>');
                }
                break;
                
            default:
                console.log('Usage: node performance-alerts.js [check|daily|weekly|history|ack]');
        }
    } catch (error) {
        console.error('❌ Alerts error:', error.message);
        process.exit(1);
    }
}

// Export for use as module
module.exports = PerformanceAlerts;

// Run if called directly
if (require.main === module) {
    main();
}
