/**
 * Bulk Email Campaign System
 * Complements social media campaigns with coordinated email outreach
 */

// Load environment variables from .env file
require('dotenv').config();

const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');
const csv = require('csv-parser');
const { createReadStream } = require('fs');

class BulkEmailCampaign {
    constructor() {
        this.emailConfig = {
            service: process.env.EMAIL_SERVICE || 'gmail',
            user: process.env.EMAIL_USER || 'gabriele.tanzitech@gmail.com',
            password: process.env.EMAIL_PASSWORD,
            from: process.env.FROM_EMAIL || 'gabriele.tanzitech@gmail.com',
            replyTo: 'gabriele.tanzitech@gmail.com'
        };
        
        this.transporter = this.setupEmailTransporter();
        this.campaignDatabase = path.join(__dirname, 'email-campaigns.json');
        this.sendLog = path.join(__dirname, 'email-send-log.json');
        
        this.emailTemplates = this.initializeEmailTemplates();
        this.sendRate = {
            emailsPerHour: 100, // Conservative rate to avoid spam filters
            batchSize: 25,      // Gmail-safe batch size
            delayBetweenBatches: 900000 // 15 minutes between batches (production safe)
        };
    }

    /**
     * Setup email transporter
     */
    setupEmailTransporter() {
        // If no credentials provided, use test mode
        if (!this.emailConfig.user || !this.emailConfig.password) {
            console.log('⚠️ No email credentials found - running in TEST MODE');
            return {
                sendMail: async (mailOptions) => {
                    // Simulate email sending for testing
                    console.log(`📧 TEST EMAIL: ${mailOptions.to}`);
                    console.log(`📝 Subject: ${mailOptions.subject}`);
                    return { messageId: 'test-' + Date.now() };
                },
                verify: (callback) => {
                    callback(null, true);
                }
            };
        }
        
        return nodemailer.createTransport({
            service: this.emailConfig.service,
            auth: {
                user: this.emailConfig.user,
                pass: this.emailConfig.password
            }
        });
    }

    /**
     * Initialize email templates for different campaign types
     */
    initializeEmailTemplates() {
        return {
            'social_media_awareness': {
                subject: "The surprising truth about social media marketing (data from 1,000 viral posts)",
                template: `Hi there,

I just finished analyzing 1,000+ viral social media posts (with over 2.5M combined engagement) and discovered something surprising...

**90% of popular social media advice is actually wrong.**

Here's what the data revealed:

🎯 **"Post at optimal times" is myth #1**
Top performers post consistently at the SAME time, regardless of "peak hours"

📊 **Long-form content outperforms short content** 
My highest LinkedIn post was 1,200 words (while "experts" recommend 150 max)

🔥 **Controversial takes generate 340% more engagement**
Data beats opinions every time

**The Real Success Formula:**
Consistency + Value + Authentic Voice > Algorithm Optimization

I've packaged this complete analysis into a free intelligence report that includes:
• Analysis of 1,000+ viral posts
• 50+ proven content templates
• Psychological triggers that drive engagement
• Competitive analysis framework

Want the full report? Just reply "DATA" and I'll send it over.

Best,
Gabriele Tanzi
TanziTech - AI & Social Media Intelligence

P.S. This research took 3 months to compile. If you find it valuable, I'd appreciate you sharing it with your network.`,
                cta: 'Reply "DATA" for free report',
                category: 'awareness'
            },
            
            'ai_consulting_offer': {
                subject: "AI implementation that actually works (case study inside)",
                template: `Hi there,

Most AI implementations fail. Here's why - and how to avoid the same mistakes.

**The Problem:** 73% of AI projects never make it to production

**The Reason:** Companies focus on technology instead of business outcomes

**The Solution:** ROI-first AI implementation (I'll show you how)

**Case Study - Manufacturing Client:**
• Challenge: Manual quality control processes
• AI Solution: Computer vision + predictive analytics
• Timeline: 90 days from concept to production
• Result: 67% reduction in defects, $2.3M annual savings
• ROI: 340% in first year

**The 5-Step Framework We Used:**
1. Business impact analysis (not technology selection)
2. Data audit and preparation strategy  
3. Pilot project with measurable outcomes
4. Stakeholder buy-in through quick wins
5. Scalable deployment with training plan

I've documented this entire framework in a comprehensive AI Implementation Playbook.

**What's included:**
• Complete implementation methodology
• ROI calculator and measurement tools
• Vendor evaluation framework
• Common pitfall avoidance guide
• 30+ real-world case studies

Want the complete playbook? Reply "PLAYBOOK" and I'll send it over.

Best,
Gabriele Tanzi
TanziTech - AI Implementation Specialist

P.S. I'm also offering 3 free 30-minute AI strategy calls this month. If you're considering AI implementation, reply "CALL" and we can explore your specific situation.`,
                cta: 'Reply "PLAYBOOK" or "CALL"',
                category: 'offer'
            },

            'social_proof_testimonial': {
                subject: "Client results: 340% increase in qualified leads (6 months)",
                template: `Hi there,

Want to see what happens when you ignore conventional social media wisdom?

**Client Case Study - B2B SaaS Company:**

**Before working with us:**
• 12 social media posts per month
• 2-3% engagement rate
• 5 qualified leads per month
• Following all "best practices"

**After implementing our intelligence-driven approach:**
• Same posting frequency (12 posts/month)
• 18.7% average engagement rate  
• 22 qualified leads per month
• Ignored 90% of conventional advice

**What changed:**
Instead of following trends, we analyzed their top-performing competitors and identified 7 specific psychological triggers that drove engagement in their industry.

**The 6-Month Results:**
• 340% increase in qualified leads
• 67% reduction in cost per lead
• $127K in new revenue directly attributed to social media
• 2,400% ROI on social media investment

**The Strategy That Made This Possible:**
We used data-driven competitive intelligence to identify exactly what content resonates with their ideal clients, then created a systematic approach to consistently deliver value.

I've documented this entire methodology in a comprehensive Social Media Intelligence Report.

**What you'll get:**
• Complete competitive analysis framework
• 50+ high-converting content templates
• Psychological trigger identification guide
• Performance tracking and optimization tools
• Industry-specific engagement strategies

Want the complete report? Reply "ANALYSIS" and I'll send it over.

Best,
Gabriele Tanzi
TanziTech - Social Media Intelligence

P.S. I'm also offering a limited number of Social Media Strategy Audits this month. If you want to see how this could work for your business, reply "AUDIT" and we can schedule a conversation.`,
                cta: 'Reply "ANALYSIS" or "AUDIT"',
                category: 'social_proof'
            }
        };
    }

    /**
     * Import email list from CSV file
     */
    async importEmailList(csvFilePath, campaignName) {
        console.log(`📥 Importing email list from: ${csvFilePath}`);
        
        const emails = [];
        const importErrors = [];
        
        return new Promise((resolve, reject) => {
            createReadStream(csvFilePath)
                .pipe(csv())
                .on('data', (row) => {
                    // Handle different CSV column formats
                    const email = row.Email || row.email || row.EMAIL || row['Email Address'] || Object.values(row)[0];
                    
                    if (this.isValidEmail(email)) {
                        emails.push({
                            email: email.toLowerCase().trim(),
                            imported: new Date().toISOString(),
                            campaign: campaignName,
                            status: 'pending'
                        });
                    } else {
                        importErrors.push({ row, error: 'Invalid email format' });
                    }
                })
                .on('end', async () => {
                    try {
                        // Save imported list
                        await this.saveEmailList(emails, campaignName);
                        
                        console.log(`✅ Imported ${emails.length} valid emails`);
                        if (importErrors.length > 0) {
                            console.log(`⚠️ ${importErrors.length} invalid emails skipped`);
                        }
                        
                        resolve({
                            totalImported: emails.length,
                            errors: importErrors.length,
                            campaignName
                        });
                    } catch (error) {
                        reject(error);
                    }
                })
                .on('error', reject);
        });
    }

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return email && emailRegex.test(email);
    }

    /**
     * Save email list to database
     */
    async saveEmailList(emails, campaignName) {
        const listPath = path.join(__dirname, `email-list-${campaignName}.json`);
        await fs.writeFile(listPath, JSON.stringify(emails, null, 2));
        
        // Update campaigns database
        let campaigns = [];
        try {
            const campaignsData = await fs.readFile(this.campaignDatabase, 'utf8');
            campaigns = JSON.parse(campaignsData);
        } catch (error) {
            // File doesn't exist, start with empty array
        }

        campaigns.push({
            name: campaignName,
            emailCount: emails.length,
            created: new Date().toISOString(),
            status: 'ready',
            listFile: `email-list-${campaignName}.json`
        });

        await fs.writeFile(this.campaignDatabase, JSON.stringify(campaigns, null, 2));
    }

    /**
     * Launch email campaign
     */
    async launchEmailCampaign(campaignName, templateType, options = {}) {
        console.log(`🚀 Launching email campaign: ${campaignName}`);
        console.log(`📧 Template: ${templateType}`);
        
        try {
            // Load email list
            const emailList = await this.loadEmailList(campaignName);
            if (!emailList || emailList.length === 0) {
                throw new Error(`No email list found for campaign: ${campaignName}`);
            }

            // Get email template
            const template = this.emailTemplates[templateType];
            if (!template) {
                throw new Error(`Unknown template type: ${templateType}`);
            }

            // Setup campaign tracking
            const campaignId = `campaign_${Date.now()}`;
            const campaignStart = new Date().toISOString();
            
            // Start batch sending process
            const sendResults = await this.sendEmailBatches(emailList, template, campaignId, options);
            
            // Log campaign results
            await this.logCampaignResults({
                campaignId,
                campaignName,
                templateType,
                startTime: campaignStart,
                endTime: new Date().toISOString(),
                totalEmails: emailList.length,
                ...sendResults
            });

            console.log(`✅ Email campaign launched successfully!`);
            console.log(`📊 Campaign ID: ${campaignId}`);
            console.log(`📈 Emails queued: ${emailList.length}`);
            console.log(`⏱️ Estimated completion: ${this.calculateCompletionTime(emailList.length)}`);
            
            return {
                campaignId,
                status: 'launched',
                totalEmails: emailList.length,
                templateType,
                estimatedCompletion: this.calculateCompletionTime(emailList.length)
            };

        } catch (error) {
            console.error('❌ Campaign launch failed:', error);
            return { status: 'failed', error: error.message };
        }
    }

    /**
     * Send emails in batches to avoid rate limits
     */
    async sendEmailBatches(emailList, template, campaignId, options) {
        const totalEmails = emailList.length;
        const totalBatches = Math.ceil(totalEmails / this.sendRate.batchSize);
        let successCount = 0;
        let failureCount = 0;
        
        console.log(`📦 Sending ${totalEmails} emails in ${totalBatches} batches`);
        console.log(`⏱️ Batch size: ${this.sendRate.batchSize}, Delay: ${this.sendRate.delayBetweenBatches / 1000}s`);

        for (let i = 0; i < totalBatches; i++) {
            const batchStart = i * this.sendRate.batchSize;
            const batchEnd = Math.min(batchStart + this.sendRate.batchSize, totalEmails);
            const batch = emailList.slice(batchStart, batchEnd);
            
            console.log(`📤 Sending batch ${i + 1}/${totalBatches} (${batch.length} emails)`);
            
            // Send batch
            const batchResults = await this.sendEmailBatch(batch, template, campaignId, options);
            successCount += batchResults.success;
            failureCount += batchResults.failures;
            
            // Wait between batches (except for last batch)
            if (i < totalBatches - 1) {
                console.log(`⏳ Waiting ${this.sendRate.delayBetweenBatches / 1000}s before next batch...`);
                await this.delay(this.sendRate.delayBetweenBatches);
            }
        }

        return { successCount, failureCount };
    }

    /**
     * Send a single batch of emails
     */
    async sendEmailBatch(batch, template, campaignId, options) {
        let success = 0;
        let failures = 0;

        const promises = batch.map(async (recipient) => {
            try {
                const emailContent = this.personalizeEmail(template, recipient, options);
                
                const mailOptions = {
                    from: this.emailConfig.from,
                    replyTo: this.emailConfig.replyTo,
                    to: recipient.email,
                    subject: emailContent.subject,
                    html: emailContent.html,
                    headers: {
                        'X-Campaign-ID': campaignId,
                        'X-Recipient-ID': recipient.email
                    }
                };

                await this.transporter.sendMail(mailOptions);
                
                // Log successful send
                await this.logEmailSend(recipient.email, campaignId, 'sent', template.subject);
                success++;
                
            } catch (error) {
                console.error(`❌ Failed to send to ${recipient.email}:`, error.message);
                await this.logEmailSend(recipient.email, campaignId, 'failed', template.subject, error.message);
                failures++;
            }
        });

        await Promise.allSettled(promises);
        return { success, failures };
    }

    /**
     * Personalize email content
     */
    personalizeEmail(template, recipient, options) {
        let subject = template.subject;
        let content = template.template;
        
        // Add personalization if available
        if (options.personalize && recipient.name) {
            content = content.replace(/Hi there,/g, `Hi ${recipient.name},`);
        }
        
        // Convert to HTML
        const html = this.convertToHTML(content, template);
        
        return { subject, html };
    }

    /**
     * Convert plain text email to HTML
     */
    convertToHTML(text, template) {
        let html = text
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/🎯|📊|🔥|📤|⏳|✅|❌|📈|💡|📦|🚀|📧/g, '<span style="font-size: 18px;">$&</span>');
        
        return `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .cta { background-color: #007bff; color: white; padding: 12px 25px; 
                       text-decoration: none; border-radius: 5px; display: inline-block; 
                       margin: 20px 0; font-weight: bold; }
                .footer { margin-top: 30px; font-size: 12px; color: #666; 
                         border-top: 1px solid #eee; padding-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <p>${html}</p>
                ${template.cta ? `<p><a href="mailto:${this.emailConfig.from}?subject=RE: ${template.subject}" class="cta">${template.cta}</a></p>` : ''}
                <div class="footer">
                    <p>TanziTech - AI & Social Media Intelligence<br>
                    If you no longer wish to receive these emails, please reply with "UNSUBSCRIBE"</p>
                </div>
            </div>
        </body>
        </html>`;
    }

    /**
     * Load email list for campaign
     */
    async loadEmailList(campaignName) {
        const listPath = path.join(__dirname, `email-list-${campaignName}.json`);
        try {
            const listData = await fs.readFile(listPath, 'utf8');
            return JSON.parse(listData);
        } catch (error) {
            return null;
        }
    }

    /**
     * Log email send result
     */
    async logEmailSend(email, campaignId, status, subject, error = null) {
        const logEntry = {
            email,
            campaignId,
            status,
            subject,
            timestamp: new Date().toISOString(),
            error
        };

        let logs = [];
        try {
            const logData = await fs.readFile(this.sendLog, 'utf8');
            logs = JSON.parse(logData);
        } catch (error) {
            // File doesn't exist, start with empty array
        }

        logs.push(logEntry);
        await fs.writeFile(this.sendLog, JSON.stringify(logs, null, 2));
    }

    /**
     * Log campaign results
     */
    async logCampaignResults(results) {
        const campaignLogPath = path.join(__dirname, 'email-campaign-results.json');
        
        let campaignLogs = [];
        try {
            const logData = await fs.readFile(campaignLogPath, 'utf8');
            campaignLogs = JSON.parse(logData);
        } catch (error) {
            // File doesn't exist, start with empty array
        }

        campaignLogs.push(results);
        await fs.writeFile(campaignLogPath, JSON.stringify(campaignLogs, null, 2));
    }

    /**
     * Calculate estimated completion time
     */
    calculateCompletionTime(totalEmails) {
        const totalBatches = Math.ceil(totalEmails / this.sendRate.batchSize);
        const totalTimeMs = totalBatches * this.sendRate.delayBetweenBatches;
        const completionTime = new Date(Date.now() + totalTimeMs);
        return completionTime.toISOString();
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get campaign status
     */
    async getCampaignStatus() {
        try {
            const campaignsData = await fs.readFile(this.campaignDatabase, 'utf8');
            const campaigns = JSON.parse(campaignsData);
            
            console.log('📊 Email Campaign Status:\n');
            campaigns.forEach((campaign, index) => {
                console.log(`${index + 1}. ${campaign.name}`);
                console.log(`   📧 Emails: ${campaign.emailCount.toLocaleString()}`);
                console.log(`   📅 Created: ${new Date(campaign.created).toLocaleDateString()}`);
                console.log(`   🎯 Status: ${campaign.status}\n`);
            });
            
            return campaigns;
            
        } catch (error) {
            console.log('No campaigns found');
            return [];
        }
    }
}

module.exports = BulkEmailCampaign;

// CLI usage
if (require.main === module) {
    const campaign = new BulkEmailCampaign();
    
    const command = process.argv[2];
    const param1 = process.argv[3];
    const param2 = process.argv[4];
    
    switch (command) {
        case 'import':
            if (!param1 || !param2) {
                console.log('Usage: node bulk-email-campaign.js import <csv_file_path> <campaign_name>');
                process.exit(1);
            }
            campaign.importEmailList(param1, param2).then(result => {
                console.log('Import completed:', result);
            }).catch(console.error);
            break;
            
        case 'launch':
            if (!param1 || !param2) {
                console.log('Usage: node bulk-email-campaign.js launch <campaign_name> <template_type>');
                console.log('Template types: social_media_awareness, ai_consulting_offer, social_proof_testimonial');
                process.exit(1);
            }
            campaign.launchEmailCampaign(param1, param2).then(result => {
                console.log('Campaign launched:', result);
            }).catch(console.error);
            break;
            
        case 'status':
            campaign.getCampaignStatus();
            break;
            
        default:
            console.log(`
📧 Bulk Email Campaign Commands:

  import <csv_file> <campaign_name>    Import email list from CSV
  launch <campaign_name> <template>    Launch email campaign  
  status                               Show campaign status

Template Types:
  social_media_awareness    Awareness campaign about social media insights
  ai_consulting_offer       AI consulting service offer
  social_proof_testimonial  Client success stories and social proof

Examples:
  node bulk-email-campaign.js import /path/to/emails.csv prospect_list
  node bulk-email-campaign.js launch prospect_list social_media_awareness
  node bulk-email-campaign.js status
            `);
    }
}
