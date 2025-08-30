/**
 * Gradual Launch Strategy for Cold Email Campaign
 * Works within Gmail rate limits while maximizing deliverability
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class GradualLauncher {
    constructor() {
        this.campaignLauncher = './data-science-cold-campaign-launcher.js';
        this.dailyLimits = {
            day1: 10,   // Very conservative start
            day2: 15,   // Gradual increase
            day3: 20,   // Building reputation
            day4: 25,   // Steady growth
            day5: 30,   // Higher volume
            day6: 35,   // Rest day prep
            day7: 0,    // Rest day
            default: 40 // Sustainable daily rate
        };
        
        this.segments = [
            'data_science_professionals',
            'marketing_executives', 
            'business_owners',
            'startup_founders',
            'consultants_agencies',
            'tech_professionals'
        ];
    }

    /**
     * Create smaller daily prospect files from the test files
     */
    async createDailyProspectFiles(segment, dailyLimit) {
        const sourceFile = `test-prospects-${segment}.csv`;
        
        try {
            const content = await fs.readFile(sourceFile, 'utf8');
            const lines = content.split('\n');
            const header = lines[0];
            const prospects = lines.slice(1).filter(line => line.trim());
            
            // Take only the daily limit number of prospects
            const dailyProspects = prospects.slice(0, dailyLimit);
            const dailyContent = [header, ...dailyProspects].join('\n');
            
            const dailyFile = `daily-prospects-${segment}-${dailyLimit}.csv`;
            await fs.writeFile(dailyFile, dailyContent);
            
            console.log(`📧 Created ${dailyFile} with ${dailyProspects.length} prospects`);
            return dailyFile;
        } catch (error) {
            console.error(`❌ Error creating daily file for ${segment}:`, error.message);
            return null;
        }
    }

    /**
     * Launch a single campaign with rate limiting
     */
    async launchGradualCampaign(segment, dailyLimit = 10) {
        console.log(`\n🚀 Launching Gradual Campaign: ${segment.replace(/_/g, ' ').toUpperCase()}`);
        console.log(`📊 Daily limit: ${dailyLimit} emails`);
        
        // Create daily prospect file
        const dailyFile = await this.createDailyProspectFiles(segment, dailyLimit);
        if (!dailyFile) {
            console.error(`❌ Failed to create daily prospect file for ${segment}`);
            return false;
        }

        return new Promise((resolve) => {
            const launchCommand = spawn('node', [
                this.campaignLauncher,
                'launch',
                segment,
                `./${dailyFile}`
            ], { stdio: 'inherit' });

            launchCommand.on('close', (code) => {
                if (code === 0) {
                    console.log(`✅ Successfully launched ${segment} campaign`);
                    resolve(true);
                } else {
                    console.log(`⚠️ Campaign launch completed with code ${code}`);
                    resolve(false);
                }
            });

            launchCommand.on('error', (error) => {
                console.error(`❌ Error launching ${segment} campaign:`, error.message);
                resolve(false);
            });
        });
    }

    /**
     * Launch all segments gradually with delays
     */
    async launchAllGradually(dailyLimit = 10, delayBetweenSegments = 300000) { // 5 minutes
        console.log('\n🚀 GRADUAL LAUNCH STRATEGY INITIATED\n');
        console.log('═══════════════════════════════════════════\n');
        console.log(`📊 Daily limit per segment: ${dailyLimit} emails`);
        console.log(`⏱️ Delay between segments: ${delayBetweenSegments / 1000 / 60} minutes`);
        console.log(`📧 Total emails today: ${this.segments.length * dailyLimit}\n`);

        const results = [];
        
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            
            console.log(`\n--- Launching Segment ${i + 1}/${this.segments.length} ---`);
            
            const success = await this.launchGradualCampaign(segment, dailyLimit);
            results.push({ segment, success, emailCount: dailyLimit });

            // Add delay between segments (except for the last one)
            if (i < this.segments.length - 1) {
                console.log(`\n⏳ Waiting ${delayBetweenSegments / 1000 / 60} minutes before next segment...`);
                await this.delay(delayBetweenSegments);
            }
        }

        // Generate summary report
        this.generateLaunchReport(results, dailyLimit);
        return results;
    }

    /**
     * Generate launch report
     */
    generateLaunchReport(results, dailyLimit) {
        const successful = results.filter(r => r.success).length;
        const totalEmails = successful * dailyLimit;
        
        console.log('\n📈 GRADUAL LAUNCH REPORT');
        console.log('═══════════════════════════');
        console.log(`✅ Successful Segments: ${successful}/${results.length}`);
        console.log(`📧 Total Emails Sent: ${totalEmails}`);
        console.log(`📈 Expected Replies: ~${Math.round(totalEmails * 0.15)}`);
        console.log(`💰 Expected Leads: ~${Math.round(totalEmails * 0.04)}`);
        
        console.log('\n🎯 Segment Results:');
        results.forEach(result => {
            const status = result.success ? '✅' : '❌';
            console.log(`   ${status} ${result.segment.replace(/_/g, ' ')}: ${result.emailCount} emails`);
        });

        console.log('\n📋 Next Steps:');
        console.log('1. Monitor email delivery rates over next 2-4 hours');
        console.log('2. Track responses using: node response-tracker.js dashboard');
        console.log('3. Gradually increase daily limits if delivery rates stay high');
        console.log('4. Scale up successful segments tomorrow');
        
        console.log('\n⚡ Tomorrow\'s Recommendation:');
        if (successful >= 4) {
            console.log(`   Increase daily limit to ${dailyLimit + 10} emails per segment`);
        } else {
            console.log(`   Keep daily limit at ${dailyLimit} emails and focus on deliverability`);
        }
    }

    /**
     * Smart daily launch based on day of campaign
     */
    async smartDailyLaunch(campaignDay = 1) {
        const dailyLimit = this.dailyLimits[`day${campaignDay}`] || this.dailyLimits.default;
        
        if (dailyLimit === 0) {
            console.log('📅 Rest day - no emails scheduled');
            console.log('💡 Use this time to:');
            console.log('   - Reply to any responses from previous days');
            console.log('   - Analyze performance metrics');
            console.log('   - Prepare for tomorrow\'s launch');
            return [];
        }

        console.log(`\n📅 Campaign Day ${campaignDay}`);
        console.log(`🎯 Today's goal: ${dailyLimit} emails per segment`);
        
        return await this.launchAllGradually(dailyLimit, 180000); // 3 minutes between segments
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Check current sending status and recommend next action
     */
    async checkSendingStatus() {
        console.log('\n🔍 Checking Current Sending Status...\n');
        
        // Count recent sends from log
        try {
            const logData = await fs.readFile('email-send-log.json', 'utf8');
            const logs = JSON.parse(logData);
            
            const now = new Date();
            const last24Hours = logs.filter(log => {
                const logTime = new Date(log.timestamp);
                return (now - logTime) < 24 * 60 * 60 * 1000;
            });
            
            const successful = last24Hours.filter(log => log.status === 'sent');
            const failed = last24Hours.filter(log => log.status === 'failed');
            
            console.log('📊 Last 24 Hours:');
            console.log(`   ✅ Successful: ${successful.length}`);
            console.log(`   ❌ Failed: ${failed.length}`);
            console.log(`   📈 Success Rate: ${((successful.length / (successful.length + failed.length)) * 100).toFixed(1)}%`);
            
            // Recommend action based on recent performance
            if (failed.length > successful.length) {
                console.log('\n⚠️ Recommendation: SLOW DOWN');
                console.log('   - High failure rate detected');
                console.log('   - Reduce daily limit to 5-10 emails');
                console.log('   - Wait 2-4 hours before next attempt');
                return { recommendation: 'slow_down', dailyLimit: 5 };
            } else if (successful.length > 20) {
                console.log('\n🚀 Recommendation: SCALE UP');
                console.log('   - Good delivery performance');
                console.log('   - Can increase daily limit to 30-40 emails');
                return { recommendation: 'scale_up', dailyLimit: 35 };
            } else {
                console.log('\n🎯 Recommendation: STEADY PACE');
                console.log('   - Continue with 10-15 emails per segment');
                console.log('   - Monitor delivery rates closely');
                return { recommendation: 'steady', dailyLimit: 15 };
            }
            
        } catch (error) {
            console.log('📭 No previous sending history found');
            console.log('\n🎯 Recommendation: START CONSERVATIVE');
            console.log('   - Begin with 5-10 emails per segment');
            console.log('   - Build sending reputation gradually');
            return { recommendation: 'start_conservative', dailyLimit: 10 };
        }
    }
}

module.exports = GradualLauncher;

// CLI usage
if (require.main === module) {
    const launcher = new GradualLauncher();
    
    const command = process.argv[2];
    const param1 = process.argv[3];
    
    switch (command) {
        case 'launch':
            const dailyLimit = parseInt(param1) || 10;
            launcher.launchAllGradually(dailyLimit).then(() => {
                console.log('\n🎯 Gradual launch completed!');
            });
            break;
            
        case 'day':
            const day = parseInt(param1) || 1;
            launcher.smartDailyLaunch(day).then(() => {
                console.log(`\n📅 Day ${day} launch completed!`);
            });
            break;
            
        case 'status':
            launcher.checkSendingStatus().then(status => {
                console.log(`\n💡 Recommended daily limit: ${status.dailyLimit} emails`);
            });
            break;
            
        case 'single':
            const segment = param1;
            const limit = parseInt(process.argv[4]) || 10;
            if (!segment) {
                console.log('Usage: node gradual-launch-strategy.js single <segment> [limit]');
                process.exit(1);
            }
            launcher.launchGradualCampaign(segment, limit).then((success) => {
                console.log(success ? '✅ Campaign launched successfully' : '❌ Campaign launch failed');
            });
            break;
            
        default:
            console.log(`
🚀 Gradual Launch Strategy

Commands:
  launch [daily_limit]       Launch all segments gradually (default: 10 emails each)
  day <day_number>          Launch based on campaign day (1-7+)
  status                    Check sending status and get recommendations
  single <segment> [limit]  Launch single segment with limit

Examples:
  node gradual-launch-strategy.js launch 15
  node gradual-launch-strategy.js day 1
  node gradual-launch-strategy.js single marketing_executives 10
  node gradual-launch-strategy.js status

Daily Limits by Campaign Day:
  Day 1: 10 emails per segment (warm-up)
  Day 2: 15 emails per segment
  Day 3: 20 emails per segment  
  Day 4: 25 emails per segment
  Day 5: 30 emails per segment
  Day 6: 35 emails per segment
  Day 7: 0 emails (rest day)
  Day 8+: 40 emails per segment (sustained rate)

🎯 Strategy: Start small, build reputation, scale gradually
            `);
    }
}
