/**
 * Lead Generation Campaign Orchestrator
 * Coordinates viral posts, lead capture, and follow-up across platforms
 */

const fs = require('fs').promises;
const path = require('path');
const LeadCaptureSystem = require('./lead-capture-automation');

class LeadGenerationCampaign {
    constructor() {
        this.leadCapture = new LeadCaptureSystem();
        this.campaignConfig = {
            maxPostsPerDay: 2,
            minEngagementThreshold: 25,
            followUpDelayHours: 2,
            platforms: ['reddit', 'hackernews', 'linkedin', 'twitter']
        };
        
        this.viralPosts = require('./viral-lead-posts.json');
        this.templates = require('./lead-generation-templates.json');
    }

    /**
     * Launch complete lead generation campaign
     */
    async launchCampaign(campaignType = 'full') {
        console.log('🚀 Starting Lead Generation Campaign...');
        
        const campaign = {
            id: `campaign_${Date.now()}`,
            type: campaignType,
            startDate: new Date().toISOString(),
            status: 'active',
            posts: [],
            leads: [],
            metrics: {}
        };

        try {
            // Phase 1: Deploy viral posts strategically
            await this.deployViralPosts(campaign);
            
            // Phase 2: Monitor engagement and capture leads
            await this.monitorAndCapture(campaign);
            
            // Phase 3: Execute follow-up sequences
            await this.executeFollowUp(campaign);
            
            // Phase 4: Generate performance report
            const report = await this.generateCampaignReport(campaign);
            
            console.log('✅ Campaign launched successfully!');
            console.log(`📊 Expected leads: ${this.calculateExpectedLeads(campaign.posts)}`);
            
            return { campaign, report };
            
        } catch (error) {
            console.error('❌ Campaign launch failed:', error);
            campaign.status = 'failed';
            campaign.error = error.message;
            return { campaign, error };
        }
    }

    /**
     * Deploy viral posts across platforms strategically
     */
    async deployViralPosts(campaign) {
        console.log('📝 Deploying viral posts...');
        
        const postsToSchedule = this.selectOptimalPosts();
        
        for (const post of postsToSchedule) {
            const scheduledPost = await this.schedulePost(post);
            campaign.posts.push(scheduledPost);
            
            console.log(`📤 Scheduled: "${scheduledPost.title}" on ${scheduledPost.platform}`);
        }
        
        // Update crosspost queue with lead generation posts
        await this.updateCrosspostQueue(campaign.posts);
    }

    /**
     * Select optimal posts for current market conditions
     */
    selectOptimalPosts() {
        const currentTime = new Date();
        const dayOfWeek = currentTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const hour = currentTime.getHours();

        console.log(`🕒 Current time: ${hour}:${currentTime.getMinutes()} (Day ${dayOfWeek})`);

        // Select posts based on timing and platform activity
        const selectedPosts = [];
        
        // Always select at least one post for immediate launch
        selectedPosts.push(this.viralPosts.ready_to_post_content.post_1_ai_consulting_leads);
        selectedPosts.push(this.viralPosts.ready_to_post_content.post_2_social_media_leads);
        
        // HackerNews performs best on weekdays, tech content
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            selectedPosts.push(this.viralPosts.ready_to_post_content.post_3_saas_growth_leads);
        }
        
        // Add B2B sales post for comprehensive coverage
        if (selectedPosts.length < this.campaignConfig.maxPostsPerDay) {
            selectedPosts.push(this.viralPosts.ready_to_post_content.post_4_b2b_sales_leads);
        }

        const finalPosts = selectedPosts.slice(0, this.campaignConfig.maxPostsPerDay);
        console.log(`📝 Selected ${finalPosts.length} posts for campaign`);
        return finalPosts;
    }

    /**
     * Schedule individual post for optimal timing
     */
    async schedulePost(post) {
        const optimalTimes = {
            linkedin: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
            reddit: new Date(Date.now() + 30 * 60 * 1000),      // 30 minutes from now  
            hackernews: new Date(Date.now() + 60 * 60 * 1000),  // 1 hour from now
            twitter: new Date(Date.now() + 15 * 60 * 1000)      // 15 minutes from now
        };

        return {
            id: `lead_post_${Date.now()}_${post.platform}`,
            platform: post.platform,
            title: post.title || post.content.split('\n')[0].replace(/🚨|🔥/, '').trim(),
            content: post.content,
            scheduledTime: optimalTimes[post.platform] || new Date(),
            expectedLeads: post.expected_leads,
            conversionRate: post.conversion_rate,
            targetAudience: post.target_audience,
            status: 'scheduled',
            category: 'lead_generation',
            priority: 'high'
        };
    }

    /**
     * Update crosspost queue with new lead generation posts
     */
    async updateCrosspostQueue(posts) {
        try {
            const queuePath = path.join(__dirname, 'crosspost-queue.json');
            let queue;
            
            try {
                const queueData = await fs.readFile(queuePath, 'utf8');
                queue = JSON.parse(queueData);
            } catch (error) {
                // Create new queue if doesn't exist
                queue = {
                    generated: new Date().toISOString(),
                    totalCrossposts: 0,
                    platforms: ['linkedin', 'reddit', 'hackernews', 'twitter'],
                    queue: []
                };
            }

            // Add new posts to queue
            for (const post of posts) {
                queue.queue.push(post);
            }

            queue.totalCrossposts = queue.queue.length;
            queue.generated = new Date().toISOString();

            await fs.writeFile(queuePath, JSON.stringify(queue, null, 2));
            console.log(`✅ Updated crosspost queue with ${posts.length} lead generation posts`);
            
        } catch (error) {
            console.error('❌ Failed to update crosspost queue:', error);
        }
    }

    /**
     * Monitor engagement and capture leads
     */
    async monitorAndCapture(campaign) {
        console.log('👀 Starting lead monitoring...');
        
        // Set up monitoring interval
        const monitoringInterval = setInterval(async () => {
            try {
                await this.leadCapture.monitorPostEngagement();
                
                // Check if campaign should continue
                const campaignAge = Date.now() - new Date(campaign.startDate).getTime();
                const maxCampaignDuration = 24 * 60 * 60 * 1000; // 24 hours
                
                if (campaignAge > maxCampaignDuration) {
                    console.log('📅 Campaign monitoring period completed');
                    clearInterval(monitoringInterval);
                }
                
            } catch (error) {
                console.error('⚠️ Monitoring error:', error);
            }
        }, 30 * 60 * 1000); // Check every 30 minutes

        // Store interval for cleanup
        campaign.monitoringInterval = monitoringInterval;
    }

    /**
     * Execute follow-up sequences for captured leads
     */
    async executeFollowUp(campaign) {
        console.log('📧 Executing follow-up sequences...');
        
        // This would integrate with email service and CRM
        setTimeout(async () => {
            const leads = await this.getRecentLeads();
            for (const lead of leads) {
                await this.sendPersonalizedFollowUp(lead);
            }
        }, this.campaignConfig.followUpDelayHours * 60 * 60 * 1000);
    }

    /**
     * Get recently captured leads
     */
    async getRecentLeads() {
        try {
            const leadsPath = path.join(__dirname, 'leads-database.json');
            const leadsData = await fs.readFile(leadsPath, 'utf8');
            const leads = JSON.parse(leadsData);
            
            // Get leads from last 24 hours
            const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
            return leads.filter(lead => new Date(lead.timestamp).getTime() > dayAgo);
        } catch (error) {
            console.log('No leads database found yet');
            return [];
        }
    }

    /**
     * Send personalized follow-up based on lead source and trigger
     */
    async sendPersonalizedFollowUp(lead) {
        const nurture = this.viralPosts.nurture_sequences[`${lead.triggerWord.toLowerCase()}_nurture`] ||
                       this.viralPosts.nurture_sequences.ai_consulting_nurture;
        
        if (nurture && nurture.day_1) {
            console.log(`📧 Sending follow-up to ${lead.author}: ${nurture.day_1.subject}`);
            // Implement actual email sending here
        }
    }

    /**
     * Calculate expected leads from campaign posts
     */
    calculateExpectedLeads(posts) {
        return posts.reduce((total, post) => {
            const minLeads = parseInt(post.expectedLeads?.split('-')[0]) || 0;
            const maxLeads = parseInt(post.expectedLeads?.split('-')[1]) || minLeads;
            return total + Math.round((minLeads + maxLeads) / 2);
        }, 0);
    }

    /**
     * Generate comprehensive campaign report
     */
    async generateCampaignReport(campaign) {
        const report = {
            campaignId: campaign.id,
            generated: new Date().toISOString(),
            duration: Math.round((Date.now() - new Date(campaign.startDate).getTime()) / 1000 / 3600), // hours
            postsScheduled: campaign.posts.length,
            expectedLeads: this.calculateExpectedLeads(campaign.posts),
            platformBreakdown: this.analyzePlatformDistribution(campaign.posts),
            timeline: this.createCampaignTimeline(campaign),
            nextActions: this.generateNextActions(campaign)
        };

        await fs.writeFile(
            path.join(__dirname, `campaign-report-${campaign.id}.json`),
            JSON.stringify(report, null, 2)
        );

        return report;
    }

    /**
     * Analyze platform distribution of campaign posts
     */
    analyzePlatformDistribution(posts) {
        return posts.reduce((breakdown, post) => {
            breakdown[post.platform] = (breakdown[post.platform] || 0) + 1;
            return breakdown;
        }, {});
    }

    /**
     * Create campaign timeline
     */
    createCampaignTimeline(campaign) {
        return {
            started: campaign.startDate,
            postsDeployed: campaign.posts.map(p => ({
                time: p.scheduledTime,
                platform: p.platform,
                title: p.title
            })),
            monitoring: 'Active for 24 hours',
            followUp: 'Scheduled based on engagement'
        };
    }

    /**
     * Generate recommended next actions
     */
    generateNextActions(campaign) {
        return [
            'Monitor post engagement for first 2 hours',
            'Respond to high-value comments within 30 minutes', 
            'Send promised resources within 1 hour of comment',
            'Schedule strategy calls with qualified leads',
            'Analyze performance after 24 hours',
            'Optimize next campaign based on results'
        ];
    }

    /**
     * Quick campaign status check
     */
    async getCampaignStatus() {
        try {
            const reports = await fs.readdir(__dirname);
            const campaignReports = reports.filter(f => f.startsWith('campaign-report-'));
            
            if (campaignReports.length > 0) {
                const latestReport = campaignReports.sort().pop();
                const reportData = await fs.readFile(path.join(__dirname, latestReport), 'utf8');
                return JSON.parse(reportData);
            }
            
            return { status: 'No active campaigns' };
        } catch (error) {
            return { status: 'Error checking campaign status', error: error.message };
        }
    }
}

// Export the class
module.exports = LeadGenerationCampaign;

// CLI usage
if (require.main === module) {
    const campaign = new LeadGenerationCampaign();
    
    const command = process.argv[2];
    switch (command) {
        case 'launch':
            const campaignType = process.argv[3] || 'full';
            campaign.launchCampaign(campaignType).then(result => {
                // Remove circular references before JSON stringify
                const cleanResult = {
                    campaignId: result.campaign.id,
                    status: result.campaign.status,
                    postsScheduled: result.campaign.posts.length,
                    expectedLeads: result.report?.expectedLeads || 0,
                    error: result.error || null
                };
                console.log('🎯 Campaign Result:', JSON.stringify(cleanResult, null, 2));
            });
            break;
        case 'status':
            campaign.getCampaignStatus().then(status => {
                console.log('📊 Campaign Status:', JSON.stringify(status, null, 2));
            });
            break;
        case 'monitor':
            console.log('👀 Starting monitoring (runs continuously)...');
            campaign.leadCapture.monitorPostEngagement();
            break;
        default:
            console.log(`
🚀 Lead Generation Campaign Commands:

  launch [type]    Launch new campaign (full/test)
  status          Check current campaign status  
  monitor         Start lead monitoring
  
Examples:
  node lead-generation-campaign.js launch full
  node lead-generation-campaign.js status
            `);
    }
}
