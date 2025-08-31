/**
 * Lead Capture Automation System
 * Integrates with existing crosspost automation to capture leads from viral posts
 */

const fs = require('fs').promises;
const path = require('path');

class LeadCaptureSystem {
    constructor() {
        this.leadDatabase = path.join(__dirname, 'leads-database.json');
        this.triggerWords = ['DATA', 'PLAYBOOK', 'OUTREACH', 'REPORT', 'ANALYSIS', 'TEMPLATE'];
        this.platforms = {
            linkedin: { enabled: false, apiKey: process.env.LINKEDIN_API_KEY },
            reddit: { enabled: true, apiKey: process.env.REDDIT_API_KEY },
            hackernews: { enabled: true, apiKey: null },
            twitter: { enabled: false, apiKey: process.env.TWITTER_API_KEY }
        };
        this.emailConfig = {
            service: process.env.EMAIL_SERVICE || 'gmail',
            user: process.env.EMAIL_USER,
            password: process.env.EMAIL_PASSWORD
        };
    }

    /**
     * Monitor posts for trigger word comments
     */
    async monitorPostEngagement() {
        try {
            const crosspostMetrics = JSON.parse(
                await fs.readFile(path.join(__dirname, 'crosspost-metrics.json'), 'utf8')
            );

            for (const [platform, data] of Object.entries(crosspostMetrics.platforms)) {
                if (this.platforms[platform]?.enabled) {
                    await this.checkPlatformComments(platform, data.posts);
                }
            }

            console.log('✅ Lead monitoring completed');
        } catch (error) {
            console.error('❌ Error monitoring engagement:', error);
        }
    }

    /**
     * Check comments on platform posts for trigger words
     */
    async checkPlatformComments(platform, posts) {
        for (const post of posts) {
            if (this.isHighEngagementPost(post)) {
                const comments = await this.fetchPostComments(platform, post.id);
                await this.processComments(platform, post, comments);
            }
        }
    }

    /**
     * Determine if post has high engagement worthy of monitoring
     */
    isHighEngagementPost(post) {
        const thresholds = {
            linkedin: 50,
            reddit: 100,
            hackernews: 50,
            twitter: 20
        };
        return post.engagement >= thresholds[post.platform];
    }

    /**
     * Fetch comments from specific platform post
     */
    async fetchPostComments(platform, postId) {
        // Mock implementation - replace with actual API calls
        switch (platform) {
            case 'reddit':
                return await this.fetchRedditComments(postId);
            case 'hackernews':
                return await this.fetchHNComments(postId);
            case 'linkedin':
                return await this.fetchLinkedInComments(postId);
            default:
                return [];
        }
    }

    /**
     * Process comments for trigger words and capture leads
     */
    async processComments(platform, post, comments) {
        for (const comment of comments) {
            const triggerFound = this.triggerWords.find(trigger => 
                comment.text.toUpperCase().includes(trigger)
            );

            if (triggerFound) {
                const lead = {
                    id: `${Date.now()}_${platform}_${comment.author}`,
                    platform: platform,
                    postId: post.id,
                    postTitle: post.title,
                    triggerWord: triggerFound,
                    author: comment.author,
                    comment: comment.text,
                    timestamp: new Date().toISOString(),
                    status: 'new',
                    followUpSent: false,
                    email: comment.email || null,
                    profileUrl: comment.profileUrl || null
                };

                await this.saveLead(lead);
                await this.sendAutoResponse(platform, comment, triggerFound);
                await this.scheduleEmailFollowUp(lead);

                console.log(`🎯 New lead captured: ${lead.author} (${triggerFound})`);
            }
        }
    }

    /**
     * Save lead to database
     */
    async saveLead(lead) {
        try {
            let leads = [];
            try {
                const existingData = await fs.readFile(this.leadDatabase, 'utf8');
                leads = JSON.parse(existingData);
            } catch (error) {
                // File doesn't exist, start with empty array
            }

            leads.push(lead);
            await fs.writeFile(this.leadDatabase, JSON.stringify(leads, null, 2));
        } catch (error) {
            console.error('Error saving lead:', error);
        }
    }

    /**
     * Send automated response to trigger comment
     */
    async sendAutoResponse(platform, comment, triggerWord) {
        const responses = {
            'DATA': `Thanks for your interest! I'm sending you the complete data analysis now. Check your DMs! 📊`,
            'PLAYBOOK': `Awesome! Sending you the full playbook right now. Look for my DM! 🚀`,
            'OUTREACH': `Perfect timing! I'll send you the outreach templates immediately. DM incoming! 💌`,
            'REPORT': `Great! The full report is coming your way via DM. Thanks for engaging! 📈`,
            'ANALYSIS': `Excellent! Sending the complete analysis to your DMs now. Enjoy! 🔍`,
            'TEMPLATE': `Love it! Templates are on their way to your DMs. Check them out! 📝`
        };

        const responseText = responses[triggerWord] || `Thanks for commenting! DMing you the resource now! 🙌`;

        // Mock implementation - replace with actual API calls
        switch (platform) {
            case 'reddit':
                await this.replyToRedditComment(comment.id, responseText);
                break;
            case 'linkedin':
                await this.replyToLinkedInComment(comment.id, responseText);
                break;
            // HackerNews doesn't support automated replies
        }

        console.log(`💬 Auto-reply sent to ${comment.author} on ${platform}`);
    }

    /**
     * Schedule email follow-up sequence
     */
    async scheduleEmailFollowUp(lead) {
        if (!lead.email) {
            console.log(`⚠️ No email for lead ${lead.author}, skipping email sequence`);
            return;
        }

        // Schedule immediate email with promised resource
        await this.sendEmail({
            to: lead.email,
            subject: this.getEmailSubject(lead.triggerWord),
            content: this.getEmailContent(lead.triggerWord, lead.author)
        });

        // Schedule follow-up emails
        setTimeout(() => this.sendFollowUpEmail(lead, 1), 3 * 24 * 60 * 60 * 1000); // 3 days
        setTimeout(() => this.sendFollowUpEmail(lead, 2), 7 * 24 * 60 * 60 * 1000); // 7 days
    }

    /**
     * Get email subject based on trigger word
     */
    getEmailSubject(triggerWord) {
        const subjects = {
            'DATA': 'Your data analysis is here (as promised)',
            'PLAYBOOK': 'Your implementation playbook (exclusive access)',
            'OUTREACH': 'Your outreach templates + bonus materials',
            'REPORT': 'Your comprehensive report (full analysis)',
            'ANALYSIS': 'Your detailed analysis (complete findings)',
            'TEMPLATE': 'Your templates + step-by-step guide'
        };
        return subjects[triggerWord] || 'Your requested resource is here';
    }

    /**
     * Get email content based on trigger word
     */
    getEmailContent(triggerWord, authorName) {
        const baseContent = `Hi ${authorName},

Thanks for engaging with my recent post! As promised, here's your ${triggerWord.toLowerCase()} resource.

[RESOURCE_LINK]

I've also included some bonus materials that weren't mentioned in the original post:
• Industry benchmarking data
• Implementation checklist
• Direct access to case studies

Quick question: What's your biggest challenge with [RELEVANT_TOPIC] right now?

I'd love to hear about your specific situation.

Best,
Gabriele Tanzi
TanziTech

P.S. If you found this valuable, I'd appreciate it if you shared it with your network!`;

        return baseContent.replace('[RELEVANT_TOPIC]', this.getRelevantTopic(triggerWord));
    }

    /**
     * Get relevant topic based on trigger word
     */
    getRelevantTopic(triggerWord) {
        const topics = {
            'DATA': 'social media analytics',
            'PLAYBOOK': 'AI implementation', 
            'OUTREACH': 'B2B sales',
            'REPORT': 'market intelligence',
            'ANALYSIS': 'performance optimization',
            'TEMPLATE': 'content strategy'
        };
        return topics[triggerWord] || 'business growth';
    }

    /**
     * Generate lead generation report
     */
    async generateLeadReport() {
        try {
            const leads = JSON.parse(await fs.readFile(this.leadDatabase, 'utf8'));
            const report = {
                generated: new Date().toISOString(),
                totalLeads: leads.length,
                leadsLast30Days: leads.filter(lead => 
                    Date.now() - new Date(lead.timestamp).getTime() < 30 * 24 * 60 * 60 * 1000
                ).length,
                platformBreakdown: this.groupBy(leads, 'platform'),
                triggerWordBreakdown: this.groupBy(leads, 'triggerWord'),
                conversionRate: this.calculateConversionRate(leads),
                topPerformingPosts: this.getTopPerformingPosts(leads),
                followUpStats: this.calculateFollowUpStats(leads)
            };

            await fs.writeFile(
                path.join(__dirname, 'lead-generation-report.json'),
                JSON.stringify(report, null, 2)
            );

            console.log('📊 Lead generation report created');
            return report;
        } catch (error) {
            console.error('Error generating lead report:', error);
        }
    }

    /**
     * Utility function to group array by property
     */
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const group = item[key];
            result[group] = (result[group] || 0) + 1;
            return result;
        }, {});
    }

    /**
     * Calculate conversion rates
     */
    calculateConversionRate(leads) {
        const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
        return leads.length > 0 ? (convertedLeads / leads.length * 100).toFixed(2) : 0;
    }

    /**
     * Get top performing posts for lead generation
     */
    getTopPerformingPosts(leads) {
        const postLeadCounts = this.groupBy(leads, 'postTitle');
        return Object.entries(postLeadCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([title, count]) => ({ title, leadCount: count }));
    }

    /**
     * Calculate follow-up statistics
     */
    calculateFollowUpStats(leads) {
        const followUpSent = leads.filter(lead => lead.followUpSent).length;
        const responseRate = leads.filter(lead => lead.responded).length;
        return {
            followUpsSent: followUpSent,
            responseRate: leads.length > 0 ? (responseRate / leads.length * 100).toFixed(2) : 0
        };
    }

    /**
     * Mock email sending function - replace with actual email service
     */
    async sendEmail(emailData) {
        console.log(`📧 Sending email to ${emailData.to}: ${emailData.subject}`);
        // Implement actual email sending logic here
    }

    /**
     * Mock follow-up email function
     */
    async sendFollowUpEmail(lead, sequence) {
        console.log(`📧 Sending follow-up email ${sequence} to ${lead.author}`);
        // Implement follow-up email sequences here
    }

    // Mock API functions - replace with actual implementations
    async fetchRedditComments(postId) { return []; }
    async fetchHNComments(postId) { return []; }
    async fetchLinkedInComments(postId) { return []; }
    async replyToRedditComment(commentId, text) { }
    async replyToLinkedInComment(commentId, text) { }
}

// Export the class
module.exports = LeadCaptureSystem;

// CLI usage
if (require.main === module) {
    const leadSystem = new LeadCaptureSystem();
    
    const command = process.argv[2];
    switch (command) {
        case 'monitor':
            leadSystem.monitorPostEngagement();
            break;
        case 'report':
            leadSystem.generateLeadReport().then(report => 
                console.log('Lead Report:', JSON.stringify(report, null, 2))
            );
            break;
        default:
            console.log(`
Usage:
  node lead-capture-automation.js monitor  # Monitor posts for leads
  node lead-capture-automation.js report   # Generate lead report
            `);
    }
}
