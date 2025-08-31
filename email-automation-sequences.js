// ====================================================================
// GABRIELE TANZI'S EMAIL AUTOMATION SEQUENCES
// Complete nurture sequences for blog lead magnets
// ====================================================================

const EmailSequences = {
    
    // Email Validation Toolkit Sequence (Technical Audience)
    emailValidationSequence: {
        name: "Email Validation Toolkit Nurture",
        triggerTag: "email-validation-download",
        delayBetweenEmails: "days",
        
        emails: [
            {
                day: 0,
                subject: "✅ Your Email Validation Toolkit is Ready (Download Inside)",
                type: "delivery",
                template: "email_validation_delivery",
                openRate: "65-75%",
                clickRate: "25-35%"
            },
            {
                day: 1, 
                subject: "🚀 Quick Win: Validate 1000 emails in under 60 seconds",
                type: "quick_win",
                template: "email_validation_quick_win",
                openRate: "45-55%",
                clickRate: "15-25%"
            },
            {
                day: 3,
                subject: "❌ The #1 mistake that ruins email deliverability (avoid this)",
                type: "education",
                template: "email_validation_mistake",
                openRate: "50-60%",
                clickRate: "20-30%"
            },
            {
                day: 5,
                subject: "📊 Case Study: How I increased email campaign ROI by 340%",
                type: "case_study", 
                template: "email_validation_case_study",
                openRate: "55-65%",
                clickRate: "25-35%"
            },
            {
                day: 7,
                subject: "🎯 Ready for a custom email strategy? (30-min consultation)",
                type: "soft_sell",
                template: "consultation_soft_sell",
                openRate: "40-50%",
                clickRate: "12-20%"
            },
            {
                day: 10,
                subject: "💡 Advanced tip: DNS-based email verification for enterprise",
                type: "advanced_content",
                template: "email_validation_advanced",
                openRate: "35-45%",
                clickRate: "18-25%"
            },
            {
                day: 14,
                subject: "⏰ Last chance: Free email strategy session (closes Friday)",
                type: "urgency_sell",
                template: "consultation_urgency",
                openRate: "45-55%",
                clickRate: "15-25%"
            }
        ]
    },

    // Social Media Intelligence Sequence (Marketing Professionals)  
    socialMediaIntelligenceSequence: {
        name: "Social Media Intelligence Templates Nurture",
        triggerTag: "social-media-templates-download",
        delayBetweenEmails: "days",
        
        emails: [
            {
                day: 0,
                subject: "📊 Your Social Media Intelligence Templates (Download Inside)",
                type: "delivery",
                template: "social_media_delivery",
                openRate: "70-80%",
                clickRate: "30-40%"
            },
            {
                day: 1,
                subject: "🎯 Quick Win: Find your competitor's best-performing content in 5 minutes",
                type: "quick_win", 
                template: "social_media_quick_win",
                openRate: "50-60%",
                clickRate: "20-30%"
            },
            {
                day: 3,
                subject: "🔥 How to spot viral content before it goes viral (insider technique)",
                type: "education",
                template: "viral_content_prediction",
                openRate: "55-65%",
                clickRate: "25-35%"
            },
            {
                day: 5,
                subject: "📈 Case Study: 150K+ engagement from one competitive analysis",
                type: "case_study",
                template: "social_media_case_study", 
                openRate: "60-70%",
                clickRate: "30-40%"
            },
            {
                day: 7,
                subject: "💰 Turn social media intelligence into revenue (strategy call available)",
                type: "soft_sell",
                template: "social_media_consultation",
                openRate: "45-55%",
                clickRate: "15-25%"
            },
            {
                day: 10,
                subject: "🚨 The social media metrics that actually matter (most ignore these)",
                type: "advanced_content",
                template: "social_media_metrics_advanced",
                openRate: "40-50%",
                clickRate: "20-28%"
            },
            {
                day: 14,
                subject: "⚡ Limited spots: Social media strategy audit (ending soon)",
                type: "urgency_sell",
                template: "social_media_audit_urgency",
                openRate: "50-60%",
                clickRate: "18-28%"
            }
        ]
    },

    // General Blog Subscriber Sequence (Mixed Audience)
    generalBlogSequence: {
        name: "Blog Subscriber Welcome & Nurture",
        triggerTag: "blog-subscriber",
        delayBetweenEmails: "days",
        
        emails: [
            {
                day: 0,
                subject: "👋 Welcome to data-driven marketing that actually works",
                type: "welcome",
                template: "blog_welcome",
                openRate: "75-85%",
                clickRate: "35-45%"
            },
            {
                day: 2,
                subject: "📊 My #1 data analysis tool that saves 10 hours per week",
                type: "tool_recommendation",
                template: "data_analysis_tool",
                openRate: "50-60%",
                clickRate: "22-32%"
            },
            {
                day: 5,
                subject: "🎯 The competitive intelligence framework I use for Fortune 500 clients",
                type: "framework",
                template: "competitive_intelligence_framework",
                openRate: "55-65%",
                clickRate: "25-35%"
            },
            {
                day: 8,
                subject: "💡 Free resources: Templates, tools, and cheat sheets",
                type: "resource_roundup",
                template: "resource_roundup",
                openRate: "45-55%",
                clickRate: "30-40%"
            },
            {
                day: 12,
                subject: "📈 Case Study: $2.3M revenue increase from social media intelligence",
                type: "case_study",
                template: "revenue_case_study",
                openRate: "60-70%",
                clickRate: "28-38%"
            },
            {
                day: 15,
                subject: "🔥 Ready to scale your data-driven marketing? Let's talk.",
                type: "consultation_offer",
                template: "general_consultation_offer",
                openRate: "40-50%",
                clickRate: "15-25%"
            }
        ]
    }
};

// ====================================================================
// EMAIL TEMPLATES
// ====================================================================

const EmailTemplates = {
    
    // EMAIL VALIDATION SEQUENCE TEMPLATES
    email_validation_delivery: {
        subject: "✅ Your Email Validation Toolkit is Ready (Download Inside)",
        preheader: "Everything you need to validate emails 30x faster than traditional methods",
        content: `
Hi {first_name},

🚀 Your Email Validation Toolkit is ready for download!

Here's what you're getting (normally $497):

✅ Complete Python email validation scripts
✅ 50K pre-validated email database  
✅ DNS configuration step-by-step guide
✅ SMTP bypass automation tools
✅ Batch processing scripts for large lists
✅ Error handling and fallback strategies

**👇 DOWNLOAD LINK:**
https://tanzitech.com/downloads/email-validation-toolkit-{subscriber_id}

**Quick Start Guide:**
1. Download the toolkit (link above)
2. Run the setup script (takes 2 minutes)  
3. Start validating emails in 2 seconds instead of 60!

**💡 Pro Tip:** Start with the "quick_validate.py" script to see immediate results.

Tomorrow, I'll send you a quick win that lets you validate 1000 emails in under 60 seconds.

Questions? Just reply to this email.

Best regards,
Gabriele Tanzi
📧 Data Strategist & Email Marketing Expert
🌐 tanzitech.com

P.S. Check your spam folder if you don't see the download link working. Gmail sometimes flags technical downloads.
        `
    },

    email_validation_quick_win: {
        subject: "🚀 Quick Win: Validate 1000 emails in under 60 seconds",
        preheader: "The fastest way to clean your email list (step-by-step guide)",
        content: `
Hi {first_name},

Yesterday you downloaded the Email Validation Toolkit. Today, let's get you a quick win.

**⚡ QUICK WIN: Bulk Email Validation in 60 Seconds**

Here's the exact process I use to validate massive email lists:

**Step 1:** Open terminal/command prompt
**Step 2:** Navigate to your toolkit folder
**Step 3:** Run: python3 bulk_validate.py your-email-list.csv
**Step 4:** Get results in under 60 seconds

**What happens:**
- ❌ Invalid emails marked (saves you from bounces)
- ✅ Valid emails confirmed (ready to send)  
- 🔄 Questionable emails flagged (manual review)
- 📊 Full report generated automatically

**Real Example:**
"Validated 2,847 emails in 47 seconds. Found 312 invalid addresses that would have killed my sender reputation." - Sarah M., Marketing Director

**🎯 Your Challenge:**
Run this on your next email list and share your results. I read every reply!

**Need Help?** 
Having issues? Reply with "HELP" and I'll personally walk you through it.

Tomorrow: The #1 mistake that destroys email deliverability (and how to avoid it)

Best,
Gabriele

P.S. The Fortune 500 companies I consult for are paying $50K+ for email optimization strategies. You're getting the same techniques free.
        `
    },

    social_media_delivery: {
        subject: "📊 Your Social Media Intelligence Templates (Download Inside)", 
        preheader: "The exact templates I use to analyze competitors and identify viral content",
        content: `
Hi {first_name},

🎯 Your Social Media Intelligence Templates are ready!

Here's your complete toolkit (normally $297):

📊 **Competitor Analysis Spreadsheet** - Track 10+ competitors effortlessly
🔥 **Viral Content Identification Guide** - Spot trends before they explode  
📈 **Engagement Rate Calculator** - Measure performance like a pro
📝 **Content Performance Tracker** - Know what works vs what doesn't
#️⃣ **Hashtag Research Templates** - Find perfect hashtags every time
💰 **Campaign ROI Dashboard** - Prove social media value to executives
👥 **Audience Analysis Framework** - Understand your followers deeply

**👇 INSTANT ACCESS:**
https://tanzitech.com/downloads/social-media-templates-{subscriber_id}

**Quick Start (5 minutes):**
1. Download all templates (link above)
2. Open "Competitor Analysis Spreadsheet"
3. Add your top 3 competitors
4. Watch the magic happen ✨

**💡 Pro Tip:** Start with the Viral Content Guide. It reveals the 5 content types that consistently get 10x more engagement.

Tomorrow: I'll show you how to find your competitor's best-performing content in just 5 minutes.

Ready to dominate your market?
Gabriele

📧 Data-Driven Marketing Strategist
🏆 Helping brands outperform competitors with social media intelligence

P.S. These templates have helped clients identify viral opportunities worth 500K+ in earned media. Use them wisely! 😉
        `
    },

    consultation_soft_sell: {
        subject: "🎯 Ready for a custom email strategy? (30-min consultation)",
        preheader: "Let's discuss your specific email challenges and opportunities",
        content: `
Hi {first_name},

Over the past week, you've seen the power of data-driven email validation.

But here's what I'm curious about...

**What's your biggest email marketing challenge right now?**

→ Low deliverability rates?
→ High bounce rates killing your sender reputation?
→ Time-consuming manual email verification?
→ Scaling email campaigns efficiently?
→ Something else entirely?

**Here's what I'm thinking...**

You downloaded my toolkit because you're serious about email marketing. The techniques I shared are just the tip of the iceberg.

**What if we could:**
✅ Increase your email deliverability to 95%+
✅ Cut your email validation time by 90%
✅ Build automated systems that scale with your growth
✅ Implement enterprise-level email intelligence

**🎁 I'd like to offer you a complimentary 30-minute Email Strategy Session.**

No pitch. No pressure. Just me analyzing your current email setup and sharing specific recommendations.

**During our call, I'll:**
- Audit your current email validation process
- Identify bottlenecks costing you time/money
- Share advanced techniques from Fortune 500 campaigns  
- Give you a custom action plan worth $1,500

**Ready to talk?**

📅 Book your free session: https://calendly.com/gabriele-tanzi/email-strategy

**Fair warning:** I only have 5 spots available this month. These sessions typically lead to $5K-$15K optimization projects, so I keep them limited.

Questions? Just reply to this email.

Talk soon,
Gabriele

P.S. Even if you don't book a call, keep implementing the techniques from the toolkit. They work incredibly well when applied consistently.
        `
    }
};

// ====================================================================
// EMAIL AUTOMATION LOGIC
// ====================================================================

class EmailAutomation {
    constructor(config) {
        this.sequences = EmailSequences;
        this.templates = EmailTemplates;
        this.config = config;
    }

    // Trigger sequence based on lead magnet downloaded
    triggerSequence(leadData) {
        const { email, firstName, leadMagnet, timestamp } = leadData;
        
        let sequenceType;
        switch(leadMagnet) {
            case 'Email Validation Toolkit':
                sequenceType = 'emailValidationSequence';
                break;
            case 'Social Media Intelligence Templates':
                sequenceType = 'socialMediaIntelligenceSequence';
                break;
            default:
                sequenceType = 'generalBlogSequence';
        }

        return this.scheduleEmailSequence(email, sequenceType, leadData);
    }

    // Schedule all emails in sequence
    scheduleEmailSequence(email, sequenceType, leadData) {
        const sequence = this.sequences[sequenceType];
        const scheduledEmails = [];

        sequence.emails.forEach(emailConfig => {
            const sendDate = this.calculateSendDate(new Date(), emailConfig.day);
            
            const scheduledEmail = {
                id: this.generateEmailId(),
                recipientEmail: email,
                sequence: sequenceType,
                emailDay: emailConfig.day,
                subject: this.personalizeSubject(emailConfig.subject, leadData),
                template: emailConfig.template,
                scheduledFor: sendDate,
                status: 'scheduled',
                leadData: leadData
            };

            scheduledEmails.push(scheduledEmail);
        });

        return scheduledEmails;
    }

    // Calculate when to send each email
    calculateSendDate(startDate, daysToAdd) {
        const sendDate = new Date(startDate);
        sendDate.setDate(sendDate.getDate() + daysToAdd);
        sendDate.setHours(10, 0, 0, 0); // Send at 10 AM
        return sendDate;
    }

    // Personalize email subject lines
    personalizeSubject(subject, leadData) {
        return subject.replace('{first_name}', leadData.firstName || 'there');
    }

    // Generate unique email ID
    generateEmailId() {
        return 'email_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get email template and personalize
    getPersonalizedEmail(templateName, leadData) {
        const template = this.templates[templateName];
        if (!template) {
            console.error(`Template ${templateName} not found`);
            return null;
        }

        let personalizedContent = template.content
            .replace(/{first_name}/g, leadData.firstName || 'there')
            .replace(/{email}/g, leadData.email)
            .replace(/{subscriber_id}/g, this.generateSubscriberId(leadData.email));

        return {
            subject: template.subject,
            preheader: template.preheader,
            content: personalizedContent,
            html: this.convertToHTML(personalizedContent)
        };
    }

    // Generate subscriber ID for download links
    generateSubscriberId(email) {
        return btoa(email).replace(/[^a-zA-Z0-9]/g, '').substr(0, 12);
    }

    // Convert plain text to HTML email
    convertToHTML(textContent) {
        return textContent
            .split('\n\n')
            .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
            .join('')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<em>$1</em>')
            .replace(/https?:\/\/[^\s]+/g, '<a href="$&">$&</a>');
    }
}

// ====================================================================
// INTEGRATION EXAMPLE
// ====================================================================

// Initialize email automation
const emailSystem = new EmailAutomation({
    sendingService: 'mailchimp', // or 'convertkit', 'activecampaign'
    apiKey: 'your-api-key-here',
    fromEmail: 'info@tanzitech.com',
    fromName: 'Gabriele Tanzi'
});

// Example: New lead downloaded email toolkit
const newLead = {
    firstName: 'John',
    email: 'john.doe@company.com',
    company: 'Tech Startup Inc',
    leadMagnet: 'Email Validation Toolkit',
    source: 'Blog',
    timestamp: new Date()
};

// Trigger automation sequence
const scheduledEmails = emailSystem.triggerSequence(newLead);
console.log('Scheduled emails:', scheduledEmails);

module.exports = {
    EmailSequences,
    EmailTemplates,
    EmailAutomation
};
