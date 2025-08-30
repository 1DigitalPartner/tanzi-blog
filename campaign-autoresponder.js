/**
 * Campaign Autoresponder System
 * Intelligent automated responses for cold email campaign replies
 * Based on trigger words and response types
 */

const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

class CampaignAutoresponder {
    constructor() {
        this.emailConfig = {
            service: process.env.EMAIL_SERVICE || 'gmail',
            user: process.env.EMAIL_USER || 'gabriele.tanzitech@gmail.com',
            password: process.env.EMAIL_PASSWORD,
            from: process.env.FROM_EMAIL || 'gabriele.tanzitech@gmail.com',
            replyTo: 'gabriele.tanzitech@gmail.com'
        };
        
        this.transporter = this.setupEmailTransporter();
        this.responseTemplates = this.initializeResponseTemplates();
        this.triggerPatterns = this.initializeTriggerPatterns();
        this.autoResponseLog = path.join(__dirname, 'autoresponse-log.json');
    }

    /**
     * Setup email transporter
     */
    setupEmailTransporter() {
        if (!this.emailConfig.user || !this.emailConfig.password) {
            console.log('⚠️ No email credentials - running in TEST MODE');
            return {
                sendMail: async (mailOptions) => {
                    console.log(`📧 TEST AUTORESPONSE: ${mailOptions.to}`);
                    console.log(`📝 Subject: ${mailOptions.subject}`);
                    return { messageId: 'test-auto-' + Date.now() };
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
     * Initialize trigger patterns for detecting response types
     */
    initializeTriggerPatterns() {
        return {
            // Direct report requests
            reportRequests: {
                patterns: [
                    /\bDATA\b/i,
                    /\bINSIGHTS\b/i,
                    /\bSTRATEGY\b/i,
                    /\bFOUNDER\b/i,
                    /\bAGENCY\b/i,
                    /\bTECH\b/i,
                    /\bREPORT\b/i,
                    /\bANALYSIS\b/i,
                    /send.*report/i,
                    /complete.*analysis/i,
                    /full.*study/i
                ],
                responseType: 'report_request'
            },

            // Interest indicators
            interest: {
                patterns: [
                    /interesting/i,
                    /intrigued/i,
                    /curious/i,
                    /tell me more/i,
                    /more information/i,
                    /learn more/i,
                    /sounds good/i,
                    /looks promising/i,
                    /want to know/i
                ],
                responseType: 'interested'
            },

            // Call/meeting requests
            callRequests: {
                patterns: [
                    /\bCALL\b/i,
                    /\bMEETING\b/i,
                    /\bDISCUSS\b/i,
                    /schedule/i,
                    /talk/i,
                    /conversation/i,
                    /15 minutes/i,
                    /30 minutes/i,
                    /strategy call/i,
                    /quick call/i
                ],
                responseType: 'call_request'
            },

            // Questions/qualification
            questions: {
                patterns: [
                    /how much/i,
                    /what.*cost/i,
                    /pricing/i,
                    /how does.*work/i,
                    /what.*include/i,
                    /case studies/i,
                    /examples/i,
                    /clients/i,
                    /results/i
                ],
                responseType: 'qualification'
            },

            // Not interested
            notInterested: {
                patterns: [
                    /not interested/i,
                    /no thank/i,
                    /not right now/i,
                    /all set/i,
                    /remove.*list/i,
                    /unsubscribe/i,
                    /don't.*contact/i,
                    /stop.*email/i
                ],
                responseType: 'not_interested'
            },

            // Timing issues
            timing: {
                patterns: [
                    /not.*right time/i,
                    /maybe later/i,
                    /few months/i,
                    /next quarter/i,
                    /circle back/i,
                    /touch base/i,
                    /busy right now/i,
                    /revisit/i
                ],
                responseType: 'timing_issue'
            }
        };
    }

    /**
     * Initialize response templates
     */
    initializeResponseTemplates() {
        return {
            report_request: {
                subject: "Your Data Science Intelligence Report (instant access)",
                template: `Hi {{firstName}},

Thanks for your interest in the Data Science Intelligence Report!

I've prepared something special for you - a complete analysis that took 3 months to compile and cost $15K in research tools. This report reveals breakthrough insights from analyzing 125 posts and 118,001 interactions.

**🔍 HERE'S WHAT YOU'LL DISCOVER:**

✅ **The 110-Character Formula** - Why short posts get 3x more engagement
✅ **The Question Paradox** - Why questions kill engagement (0 out of 5 top posts used them)
✅ **Platform Performance Data** - Reddit gets 6.4x more engagement than Twitter for tech content
✅ **Viral Content Patterns** - 5 psychological triggers that drive massive engagement
✅ **Implementation Templates** - Ready-to-use frameworks for immediate results

**📊 COMPANIES USING THESE INSIGHTS SEE:**
• 300% engagement increase
• 67% better lead quality  
• 85% time efficiency improvement
• 45% faster growth

**🚀 GET INSTANT ACCESS:**

Click here to download your FREE report (normally $497):
**👉 Simply reply "SEND REPORT" to this email for instant access**

The report will be delivered instantly to your email once you confirm your details.

**Why the extra step?** This ensures you get the properly formatted PDF version with all charts, templates, and bonus materials - plus it helps me send you relevant updates.

**Quick question:** What's your biggest challenge with content performance right now? I'd be happy to provide specific guidance.

Best,
Gabriele Tanzi
TanziTech - Data Science Intelligence

P.S. This offer expires in 7 days. The research behind this report analyzed 118,001 real social media interactions - no theory, just data-driven insights that work.`,
                attachments: [],
                followupSequence: 'report_delivered'
            },

            interested: {
                subject: "Re: Data Science Content Strategy Insights",
                template: `Hi {{firstName}},

Great to hear you're interested in improving your data science content strategy!

I've got something that will change how you think about content performance. After analyzing 118,001 social media interactions, I discovered 5 insights that contradict everything "experts" recommend.

**🔍 HERE'S A PREVIEW:**

✅ **The 110-Character Rule** - Short posts get 3x more engagement than long technical explanations
✅ **Why Questions Kill Engagement** - 0 out of 5 top posts used questions (shocking, right?)
✅ **Platform Performance Secrets** - Reddit generates 6.4x more engagement than Twitter for tech content

**📊 RESULTS COMPANIES ARE SEEING:**
• 300% engagement increase
• 67% better lead quality
• 85% time efficiency improvement
• 45% faster growth

**🚀 WANT THE COMPLETE ANALYSIS?**

I've compiled everything into a comprehensive intelligence report (normally $497, free for a limited time):

**👉 Simply reply "SEND REPORT" to this email for instant access**

The report includes:
• All 5 breakthrough findings with data
• Platform-specific optimization strategies
• Ready-to-use content templates
• Competitor analysis framework
• ROI tracking methods

**Quick question:** What's your biggest challenge with content performance right now? I'd love to provide specific guidance.

Or if you'd prefer a 15-minute discussion about your specific situation, here's my calendar: {{calendarLink}}

Best,
Gabriele Tanzi
TanziTech - Data Science Intelligence

P.S. This analysis took 3 months and $15K in research tools. I'm sharing it free to build our data science community, but the offer expires in 7 days.`,
                followupSequence: 'general_interest'
            },

            call_request: {
                subject: "Re: Strategy Discussion",
                template: `Hi {{firstName}},

I'd be happy to discuss how these data science insights could work for your specific situation.

**Here's what I'll come prepared with:**
• Quick analysis of your current content approach
• 3 specific improvements you could implement immediately  
• Case study from {{industry}} showing real ROI results
• The exact formulas from my 118,001 interaction analysis

**What you'll walk away with:**
Clear next steps to improve your content performance, regardless of whether we work together.

**Calendar Link:** {{calendarLink}}

**Or reply with 2-3 times that work for you this week:**
- Tuesday 2-4 PM
- Wednesday 10 AM - 12 PM  
- Thursday 1-3 PM
- Friday 9-11 AM

**One quick question before we chat:** What's your current biggest challenge with content performance?

This will help me prepare specific insights for our discussion.

Best,
Gabriele Tanzi
TanziTech

P.S. These calls typically run 15-20 minutes and focus on providing value rather than selling. I'll share actionable insights you can use immediately.`,
                followupSequence: 'call_requested'
            },

            qualification: {
                subject: "Re: Your Questions About Data Science Intelligence",
                template: `Hi {{firstName}},

Great questions! Let me address them directly:

**What's included in the analysis:**
• Complete breakdown of 125 viral posts (118,001 interactions analyzed)
• Platform-specific optimization strategies (Reddit generates 6.4x more engagement than Twitter)
• The 110-character engagement formula with proven templates
• 5 psychological triggers that drive viral content
• Competitive analysis framework for any industry

**How it works:**
This isn't theory - it's based on real performance data. I've identified specific patterns that consistently drive engagement and converted them into actionable frameworks you can use immediately.

**Client results:**
• TechFlow Solutions: 340% increase in qualified leads (6 months)
• Marketing Agency: $127K in new revenue attributed to content strategy  
• B2B Software Company: $50K in contracts from social media in 90 days

**Investment:**
The complete intelligence report is free (normally $497). If you want help implementing it, we can discuss strategic partnerships, but there's no obligation.

Want to see the analysis? Just reply "INSIGHTS" and I'll send it over.

Or if you'd like to discuss your specific situation, here's my calendar: {{calendarLink}}

Best,
Gabriele Tanzi
TanziTech

P.S. I'm also including a bonus section on competitive intelligence that shows how to identify content gaps your competitors are missing.`,
                followupSequence: 'qualification_answered'
            },

            not_interested: {
                subject: "Re: No Problem at All",
                template: `Hi {{firstName}},

No problem at all - I completely understand.

If anything changes or if you'd like to be removed from future updates, just let me know.

Best of luck with your content strategy!

Best,
Gabriele Tanzi
TanziTech

P.S. If you ever want to see what 118,001 content interactions revealed about what actually works (vs. what experts recommend), the analysis is always available. No strings attached.`,
                followupSequence: 'not_interested',
                suppressFuture: true
            },

            timing_issue: {
                subject: "Re: Perfect - Let's Connect When the Time is Right",
                template: `Hi {{firstName}},

Perfect timing is important, and I completely understand.

**Here's what I'll do:**
I'll add a note to follow up with you in {{timeframe}} about the data science content insights.

**In the meantime:**
If you want to see what 118,001 interactions revealed about content performance, the complete analysis is available anytime. Just reply "INSIGHTS" when you're ready.

**Key finding you might find interesting now:**
The most successful content creators do the opposite of what "experts" recommend. Posts averaging 110 characters outperform lengthy articles by 300%.

Looking forward to connecting when the timing is better for you.

Best,
Gabriele Tanzi
TanziTech

P.S. I'll make a note to reach out in {{timeframe}}. No need to respond unless something changes before then.`,
                followupSequence: 'timing_noted',
                followupDelay: '3 months'
            }
        };
    }

    /**
     * Analyze incoming response and determine type
     */
    analyzeResponse(responseContent) {
        const content = responseContent.toLowerCase();
        let responseType = 'interested'; // default
        let confidence = 0.5;
        let triggers = [];
        let typePriority = {
            'report_request': 10,
            'call_request': 8,
            'not_interested': 9,
            'qualification': 7,
            'timing_issue': 6,
            'interested': 5
        };
        let highestPriority = 0;

        // Check each pattern category
        for (const [category, config] of Object.entries(this.triggerPatterns)) {
            for (const pattern of config.patterns) {
                if (pattern.test(content)) {
                    triggers.push(pattern.source);
                    
                    // Use priority system to determine best match
                    const priority = typePriority[config.responseType] || 1;
                    if (priority > highestPriority) {
                        highestPriority = priority;
                        responseType = config.responseType;
                        confidence = 0.9;
                    }
                }
            }
        }

        return {
            responseType,
            confidence,
            triggers,
            originalContent: responseContent
        };
    }

    /**
     * Generate personalized autoresponse
     */
    generateAutoresponse(analysis, recipientData, originalCampaign) {
        const template = this.responseTemplates[analysis.responseType] || this.responseTemplates.interested;
        
        let responseContent = template.template;
        let subject = template.subject;

        // Personalize content
        responseContent = responseContent
            .replace(/{{firstName}}/g, recipientData.firstName || recipientData.name || 'there')
            .replace(/{{fullName}}/g, recipientData.fullName || recipientData.name || '')
            .replace(/{{company}}/g, recipientData.company || '')
            .replace(/{{industry}}/g, this.getIndustryFromSegment(originalCampaign.audienceSegment))
            .replace(/{{reportType}}/g, this.getReportTypeFromTrigger(analysis.triggers))
            .replace(/{{calendarLink}}/g, 'https://calendly.com/gabrieletanzi/strategy-call')
            .replace(/{{timeframe}}/g, this.extractTimeframe(analysis.originalContent));

        return {
            subject,
            content: responseContent,
            template: template,
            analysis
        };
    }

    /**
     * Send automated response
     */
    async sendAutoresponse(recipientEmail, autoresponse, originalCampaign) {
        const mailOptions = {
            from: this.emailConfig.from,
            replyTo: this.emailConfig.replyTo,
            to: recipientEmail,
            subject: autoresponse.subject,
            html: this.formatEmailHTML(autoresponse.content),
            text: autoresponse.content,
            headers: {
                'X-Autoresponse': 'true',
                'X-Original-Campaign': originalCampaign.campaignId,
                'X-Response-Type': autoresponse.analysis.responseType
            }
        };

        try {
            const result = await this.transporter.sendMail(mailOptions);
            
            // Log the autoresponse
            await this.logAutoresponse({
                recipientEmail,
                responseType: autoresponse.analysis.responseType,
                originalCampaign: originalCampaign.campaignId,
                subject: autoresponse.subject,
                sentAt: new Date().toISOString(),
                messageId: result.messageId,
                triggers: autoresponse.analysis.triggers
            });

            console.log(`✅ Autoresponse sent to ${recipientEmail}: ${autoresponse.analysis.responseType}`);
            return { success: true, messageId: result.messageId };

        } catch (error) {
            console.error(`❌ Failed to send autoresponse to ${recipientEmail}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Process incoming response (main method)
     */
    async processIncomingResponse(responseData) {
        console.log(`📧 Processing response from ${responseData.email}`);

        // Analyze the response
        const analysis = this.analyzeResponse(responseData.responseContent);
        console.log(`🔍 Response type detected: ${analysis.responseType} (confidence: ${analysis.confidence})`);

        // Get recipient data
        const recipientData = {
            firstName: responseData.firstName || responseData.email.split('@')[0],
            fullName: responseData.fullName || responseData.firstName || '',
            company: responseData.company || responseData.email.split('@')[1],
            email: responseData.email
        };

        // Generate autoresponse
        const autoresponse = this.generateAutoresponse(analysis, recipientData, {
            campaignId: responseData.campaignId,
            audienceSegment: responseData.audienceSegment
        });

        // Send autoresponse (if not "not interested")
        if (analysis.responseType !== 'not_interested' || analysis.confidence < 0.9) {
            await this.sendAutoresponse(responseData.email, autoresponse, {
                campaignId: responseData.campaignId
            });
        }

        return {
            processed: true,
            responseType: analysis.responseType,
            autoresponseSent: analysis.responseType !== 'not_interested'
        };
    }

    /**
     * Helper methods
     */
    getIndustryFromSegment(segment) {
        const industryMap = {
            'data_science_professionals': 'data science and analytics',
            'marketing_executives': 'B2B marketing',
            'business_owners': 'business services',
            'startup_founders': 'technology startups',
            'consultants_agencies': 'consulting and agencies',
            'tech_professionals': 'technology services'
        };
        return industryMap[segment] || 'your industry';
    }

    getReportTypeFromTrigger(triggers) {
        if (triggers.some(t => t.includes('INSIGHTS'))) return 'Marketing Intelligence Report';
        if (triggers.some(t => t.includes('DATA'))) return 'Data Science Intelligence Report';
        if (triggers.some(t => t.includes('STRATEGY'))) return 'Business Intelligence Report';
        if (triggers.some(t => t.includes('FOUNDER'))) return 'Startup Playbook';
        if (triggers.some(t => t.includes('AGENCY'))) return 'Agency Methodology Guide';
        return 'Data Science Intelligence Report';
    }

    extractTimeframe(content) {
        if (/few months/i.test(content)) return '3 months';
        if (/next quarter/i.test(content)) return '3 months';
        if (/early next year/i.test(content)) return '6 months';
        if (/after.*project/i.test(content)) return '2 months';
        return '3 months';
    }

    formatEmailHTML(content) {
        const html = content
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/• /g, '<li>')
            .replace(/<li>/g, '</li><li>')
            .replace(/<\/li><li>/g, '<li>')
            .replace(/(<li>.*?)(?=<p>|$)/gs, '<ul>$1</ul>');

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { padding: 30px; background: #f8f9fa; }
                .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; background: #e9ecef; border-radius: 0 0 8px 8px; }
                ul { margin: 15px 0; padding-left: 20px; }
                li { margin: 5px 0; }
                strong { color: #059669; }
                a { color: #059669; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>TanziTech - Data Science Intelligence</h2>
                </div>
                <div class="content">
                    <p>${html}</p>
                </div>
                <div class="footer">
                    <p>Best regards,<br><strong>Gabriele Tanzi</strong><br>TanziTech</p>
                    <p>📧 <a href="mailto:contact@tanzitech.com">contact@tanzitech.com</a> | 🌐 <a href="https://tanzitech.com">tanzitech.com</a></p>
                    <p style="margin-top: 15px; font-size: 10px;">
                        This email was sent in response to your inquiry about our data science content analysis.
                        <br>To unsubscribe, simply reply with "UNSUBSCRIBE"
                    </p>
                </div>
            </div>
        </body>
        </html>`;
    }

    /**
     * Log autoresponse for tracking
     */
    async logAutoresponse(data) {
        let logs = [];
        try {
            const logData = await fs.readFile(this.autoResponseLog, 'utf8');
            logs = JSON.parse(logData);
        } catch (error) {
            // File doesn't exist, start fresh
        }

        logs.push(data);
        await fs.writeFile(this.autoResponseLog, JSON.stringify(logs, null, 2));
    }

    /**
     * Get autoresponse statistics
     */
    async getAutoresponseStats() {
        try {
            const logs = JSON.parse(await fs.readFile(this.autoResponseLog, 'utf8'));
            
            const stats = {
                totalAutoresponses: logs.length,
                byType: {},
                last24Hours: 0,
                last7Days: 0
            };

            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            logs.forEach(log => {
                // Count by type
                stats.byType[log.responseType] = (stats.byType[log.responseType] || 0) + 1;
                
                // Count recent activity
                const logDate = new Date(log.sentAt);
                if (logDate > oneDayAgo) stats.last24Hours++;
                if (logDate > sevenDaysAgo) stats.last7Days++;
            });

            return stats;
        } catch (error) {
            return {
                totalAutoresponses: 0,
                byType: {},
                last24Hours: 0,
                last7Days: 0
            };
        }
    }
}

module.exports = CampaignAutoresponder;

// CLI usage for testing
if (require.main === module) {
    const autoresponder = new CampaignAutoresponder();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'test-dry':
            // Test autoresponder without sending emails (dry run)
            const dryTestResponse = {
                email: 'john.doe@example.com', // Fake email for dry run
                firstName: 'John',
                company: 'TechCorp', 
                campaignId: 'campaign_test_dry',
                audienceSegment: 'marketing_executives',
                responseContent: 'This looks really interesting! Can you send me the INSIGHTS report?'
            };
            
            console.log('🧪 DRY RUN: Testing autoresponder logic without sending emails...');
            
            // Analyze the response
            const analysis = autoresponder.analyzeResponse(dryTestResponse.responseContent);
            console.log('🔍 Response type detected:', analysis.responseType, '(confidence:', analysis.confidence + ')');
            
            // Generate autoresponse
            const recipientData = {
                firstName: dryTestResponse.firstName,
                company: dryTestResponse.company,
                email: dryTestResponse.email
            };
            
            const autoresponse = autoresponder.generateAutoresponse(analysis, recipientData, {
                campaignId: dryTestResponse.campaignId,
                audienceSegment: dryTestResponse.audienceSegment
            });
            
            console.log('\n📧 Generated Email:');
            console.log('Subject:', autoresponse.subject);
            console.log('\n📝 Content Preview (first 200 chars):');
            console.log(autoresponse.content.substring(0, 200) + '...');
            
            console.log('\n✅ Dry run complete! Email logic working correctly.');
            console.log('💡 Use "test" command to send a real email to your address.');
            break;
            
        case 'test':
            // Test autoresponder with sample data (using your real email for testing)
            const testResponse = {
                email: 'gabriele.tanzitech@gmail.com', // Use your own email for testing
                firstName: 'Test User',
                company: 'TechCorp',
                campaignId: 'campaign_test_123',
                audienceSegment: 'marketing_executives',
                responseContent: 'This looks really interesting! Can you send me the INSIGHTS report?'
            };
            
            console.log('🧪 Testing autoresponder with real email delivery...');
            console.log('📧 Test email will be sent to:', testResponse.email);
            
            autoresponder.processIncomingResponse(testResponse).then(result => {
                console.log('✅ Test autoresponse result:', result);
                console.log('📬 Check your email at', testResponse.email, 'for the test autoresponse!');
            }).catch(error => {
                console.error('❌ Test failed:', error.message);
            });
            break;
            
        case 'stats':
            autoresponder.getAutoresponseStats().then(stats => {
                console.log('\n📊 Autoresponse Statistics:');
                console.log(`   Total: ${stats.totalAutoresponses}`);
                console.log(`   Last 24h: ${stats.last24Hours}`);
                console.log(`   Last 7d: ${stats.last7Days}`);
                console.log('\n📈 By Response Type:');
                Object.entries(stats.byType).forEach(([type, count]) => {
                    console.log(`   ${type}: ${count}`);
                });
            });
            break;
            
        default:
            console.log(`
📧 Campaign Autoresponder

Commands:
  test     Test autoresponder with sample data
  stats    Show autoresponse statistics

Features:
✅ Intelligent response detection (6 types)
✅ Personalized templates for each response type  
✅ Automatic report delivery for trigger words
✅ Calendar link integration for meeting requests
✅ Professional HTML formatting
✅ Response tracking and analytics

Response Types Handled:
• Report Requests (DATA, INSIGHTS, STRATEGY, etc.)
• General Interest ("looks interesting", "tell me more")
• Meeting/Call Requests (CALL, MEETING, schedule)
• Qualification Questions (pricing, how it works)
• Not Interested (unsubscribe, remove, not interested)
• Timing Issues (not right now, maybe later)

Usage:
const autoresponder = new CampaignAutoresponder();
await autoresponder.processIncomingResponse(responseData);
            `);
    }
}
