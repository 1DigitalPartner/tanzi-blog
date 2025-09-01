// ====================================================================
// GABRIELE TANZI'S COLD EMAIL SYSTEM
// Professional outbound lead generation for data-driven marketing services
// ====================================================================

const ColdEmailTemplates = {
    
    // ================================================================
    // EMAIL VALIDATION / TECHNICAL SERVICES TEMPLATES
    // ================================================================
    
    emailValidationSequence: {
        name: "Email Validation & Technical Optimization",
        targetAudience: "CTOs, VPs of Engineering, Email Marketing Managers, Technical Directors",
        sequenceDays: [1, 4, 8, 15],
        
        email1: {
            subject: "{{firstName}}, is email validation costing you ${{estimatedLoss}}/month?",
            preheader: "Quick question about your email deliverability rates",
            template: `Hi {{firstName}},

Quick question: How much time does your team spend waiting for email validation?

I was researching {{companyName}} and noticed you're likely processing {{emailVolume}}+ emails monthly. If you're using traditional SMTP validation, that's probably costing you:

💰 ${{estimatedLoss}}/month in delayed campaigns
⏱️ {{hoursWasted}} hours/week in timeout delays  
📉 {{deliverabilityLoss}}% deliverability loss from bounces

I built a DNS-based email validation system that detects invalid addresses in 2 seconds vs 60-second SMTP timeouts. 

**Real results:** One client cut email validation time by 95% and increased campaign ROI by 340%.

Worth a 15-minute conversation?

Best regards,
Gabriele Tanzi
Data Strategist & Email Optimization Expert

P.S. I analyzed your domain's MX records - there might be a quick optimization that could improve your deliverability immediately.`
        },
        
        email2: {
            subject: "{{firstName}}, saw {{companyName}}'s latest email campaign (impressive!)",
            preheader: "One quick optimization could increase your ROI by 30%+",
            template: `Hi {{firstName}},

I noticed {{companyName}}'s recent email campaign about {{campaignTopic}} - smart approach to {{marketingGoal}}.

One thing caught my attention: your current email validation setup might be limiting your reach.

Quick technical insight: Your domain uses {{mxRecordCount}} MX records, but I spotted a configuration that could be causing {{technicalIssue}}.

This is actually common - I helped {{similarCompany}} fix a similar issue and they saw:
- 23% improvement in deliverability
- $47K increase in monthly email revenue  
- 60% faster campaign execution

The fix takes about 15 minutes to implement.

Want me to send you the technical details?

Best,
Gabriele

📧 Data Strategist & Email Infrastructure Expert
🔗 Recently featured: DNS-based email validation case study`
        },
        
        email3: {
            subject: "{{firstName}}, the {{technicalProblem}} at {{companyName}} (5-min fix)",
            preheader: "This email infrastructure issue could be costing you thousands",
            template: `{{firstName}},

I've been analyzing email infrastructure for Fortune 500 companies, and I keep seeing the same costly mistake.

**The Problem:** {{technicalProblem}}
**The Impact:** ${{monthlyLoss}}/month in lost revenue
**The Fix:** 5-minute DNS configuration change

Here's what's happening at {{companyName}}:

❌ **Current State:** {{currentIssue}}
✅ **Optimized State:** {{optimizedSolution}}
📊 **Expected Improvement:** {{expectedGain}}

I've created a custom technical audit for your domain showing exactly how to fix this.

**No cost, no pitch** - just technical insights that could save you thousands monthly.

Interested in the 2-page technical report?

Best regards,
Gabriele Tanzi

P.S. The audit includes Python scripts you can implement immediately.`
        },
        
        email4: {
            subject: "{{firstName}}, closing this technical audit for {{companyName}}",
            preheader: "Last chance to get the custom email infrastructure analysis",
            template: `Hi {{firstName}},

I'm wrapping up technical audits this week and wanted to check one last time.

The email infrastructure analysis I created for {{companyName}} shows:
- Specific DNS optimizations for your domain
- Python scripts for 95% faster email validation  
- Configuration fixes worth ${{potentialSavings}}/month

**Takes 2 minutes to review, could save thousands.**

Since you're technical, you'll appreciate the depth - it's not generic advice, but specific optimizations for your infrastructure.

Should I send it over, or are you all set with your current email validation approach?

Either way, no worries!

Best,
Gabriele

---
P.S. If timing isn't right now, I'll check back in Q2. Email infrastructure optimization isn't going anywhere! 😄`
        }
    },

    // ================================================================
    // SOCIAL MEDIA INTELLIGENCE TEMPLATES
    // ================================================================
    
    socialMediaSequence: {
        name: "Social Media Intelligence & Competitive Analysis",
        targetAudience: "Marketing Directors, CMOs, Social Media Managers, Growth Leaders",
        sequenceDays: [1, 3, 7, 14],
        
        email1: {
            subject: "{{firstName}}, {{companyName}}'s social media vs {{competitorName}} (data inside)",
            preheader: "Competitive analysis: where you're winning and losing engagement",
            template: `Hi {{firstName}},

I was analyzing social media performance in the {{industry}} space and {{companyName}} caught my attention.

**Quick competitive snapshot:**
- {{companyName}}: {{yourEngagement}} average engagement
- {{competitorName}}: {{competitorEngagement}} average engagement  
- Industry leaders: {{industryLeaders}} engagement

Your content strategy around {{contentTopic}} is working well, but I noticed {{competitorName}} is outperforming you on {{platformName}} with their {{competitorStrategy}} approach.

**Interesting finding:** They're using a specific content framework that's driving {{competitorResults}}.

I have the full competitive analysis (15 data points across 5 platforms) - would this be useful for your Q4 planning?

Best,
Gabriele Tanzi
Social Media Intelligence Expert

P.S. The analysis includes the exact hashtags and posting times your competitors use to get 3x higher engagement.`
        },
        
        email2: {
            subject: "{{firstName}}, {{companyName}} is missing this {{industry}} trend",
            preheader: "Your competitors started using this 3 weeks ago",
            template: `{{firstName}},

Quick heads-up on a trend shift in {{industry}} social media:

**The Opportunity:** {{trendOpportunity}}
**Early Adopters:** {{competitorList}}
**Results They're Seeing:** {{trendResults}}

I noticed {{companyName}} hasn't moved on this yet, but your brand voice would be perfect for it.

**Specific recommendation:** {{specificTactic}} on {{platform}} around {{contentTheme}}.

**Why this works:** {{dataInsight}} (I analyzed 500+ posts in your industry).

The window is closing fast - {{competitorName}} just posted 3 pieces of content using this approach and got {{competitorEngagement}}.

Want me to send you the content framework that's driving these results?

Best,
Gabriele

📊 Currently tracking: {{currentTrends}} for {{clientCount}} brands`
        },
        
        email3: {
            subject: "{{firstName}}, ROI data: {{companyName}} vs industry (concerning)",
            preheader: "Your social media ROI is {{percentageBehind}} behind industry leaders",
            template: `Hi {{firstName}},

I've been crunching social media ROI numbers for {{industry}} companies.

**Industry Benchmark:** ${{industryROI}} revenue per 1K followers
**Top Performers:** ${{topPerformerROI}} revenue per 1K followers  
**{{companyName}} Estimated:** ${{yourEstimatedROI}} revenue per 1K followers

**The Gap:** You're leaving ${{lostRevenue}}/month on the table.

**Root Cause Analysis:**
- Content engagement: {{engagementGap}} below top performers
- Conversion funnel: {{conversionGap}} drop-off rate
- Posting optimization: {{optimizationGap}} suboptimal timing

**Quick Win:** {{quickWinRecommendation}}
**Expected Impact:** {{quickWinImpact}} revenue increase

I've built a social media intelligence dashboard that tracks these metrics automatically.

Would a 15-minute demo be valuable for your team?

Best regards,
Gabriele Tanzi

📈 Helped {{clientCount}}+ brands increase social ROI by 200%+ in 90 days`
        },
        
        email4: {
            subject: "{{firstName}}, final social media intelligence report for {{companyName}}",
            preheader: "Comprehensive competitive analysis - 47 actionable insights",
            template: `{{firstName}},

I finished the comprehensive social media intelligence report for {{companyName}}.

**47 actionable insights across:**
- Competitive content analysis (what's working for {{topCompetitor}})
- Viral content prediction framework  
- Platform-specific optimization strategies
- Revenue-driving hashtag research
- Optimal posting schedule for your audience

**Most valuable insight:** {{topInsight}} - this alone could increase your engagement by {{engagementIncrease}}.

The report is ready to send, but I realize you might be swamped with other priorities.

**Two options:**
1. I'll email the full report (22 pages, very actionable)
2. No worries at all - I'll keep you on my industry insights list for future trends

Either way works for me!

Best,
Gabriele

---
🎯 P.S. One client implemented just 3 insights from a similar report and increased their social media ROI by 340% in 6 weeks.`
        }
    },

    // ================================================================
    // GENERAL DATA STRATEGY TEMPLATES  
    // ================================================================
    
    dataStrategySequence: {
        name: "Data-Driven Marketing Strategy & Analytics",
        targetAudience: "CEOs, CMOs, VPs of Marketing, Growth Directors",
        sequenceDays: [1, 5, 10, 18],
        
        email1: {
            subject: "{{firstName}}, is {{companyName}} making data-driven decisions?",
            preheader: "Quick question about your marketing analytics setup",
            template: `Hi {{firstName}},

Quick question: What percentage of your marketing decisions are backed by solid data?

I ask because I was researching {{industry}} companies and noticed most are flying blind on key metrics.

**Common blind spots I see:**
- Customer acquisition cost trends (real CAC, not just ad spend)
- Content performance attribution (which pieces actually drive revenue)
- Competitive intelligence (what's working for {{mainCompetitor}})
- Pipeline attribution (which channels produce the best customers)

**The cost of guesswork:** Companies without proper marketing analytics typically waste 30-40% of their marketing budget.

For {{companyName}} at {{estimatedRevenue}} revenue, that's roughly ${{wastedBudget}}/year in suboptimal decisions.

I help companies implement data-driven marketing systems that eliminate guesswork.

**Recent result:** Helped {{caseStudyCompany}} increase marketing ROI by 290% by fixing their attribution tracking.

Worth a 15-minute conversation about your current analytics setup?

Best,
Gabriele Tanzi
Data Strategy & Marketing Intelligence Expert`
        },
        
        email2: {
            subject: "{{firstName}}, {{companyName}}'s marketing data might be wrong",
            preheader: "Found potential attribution issues in your funnel",
            template: `{{firstName}},

I was analyzing marketing funnels in the {{industry}} space and noticed something concerning about {{companyName}}'s setup.

**Potential issue:** {{attributionProblem}}
**Why it matters:** You might be over-investing in {{channel1}} and under-investing in {{channel2}}

This is surprisingly common. Last month I audited a {{similarSize}} company and found they were:
- Crediting {{incorrectChannel}} with 40% of conversions
- Actually, {{correctChannel}} was driving those sales  
- They shifted $50K/month in ad spend and increased ROI by 180%

**For {{companyName}}, this could mean:**
- ${{monthlyWaste}} in misallocated ad spend
- {{missedOpportunity}} in untapped channels
- {{incorrectDecision}} based on inaccurate data

Want me to do a quick (free) marketing attribution audit? 

Takes 15 minutes, could save you thousands monthly.

Best,
Gabriele

📊 Recently audited: {{recentClients}} marketing stacks`
        },
        
        email3: {
            subject: "{{firstName}}, your competitors' secret marketing advantage",
            preheader: "They're using data insights you don't have access to",
            template: `Hi {{firstName}},

Your competitors have a secret weapon you probably don't know about.

**The Advantage:** Advanced marketing intelligence systems that track:
- Competitor content performance in real-time
- Market trend predictions 3-4 weeks early  
- Customer behavior patterns across touchpoints
- Attribution data most companies miss

**Example:** {{competitorName}} increased market share by {{marketShareGain}} in {{timeframe}} using predictive content analytics.

**Their strategy:** {{competitorStrategy}}
**Result:** {{competitorResult}}

Most companies react to what competitors did last month. Smart companies predict what competitors will do next month.

**The difference:** ${{revenueGap}} in additional revenue for companies using predictive marketing intelligence.

I've built these systems for {{clientCount}} companies. Average ROI increase: {{averageROI}}.

Curious how {{companyName}} stacks up against your top 3 competitors?

I can run a competitive intelligence audit - takes 20 minutes, very revealing.

Interested?

Best,
Gabriele Tanzi

🎯 Marketing Intelligence & Predictive Analytics Expert`
        },
        
        email4: {
            subject: "{{firstName}}, closing the {{companyName}} marketing intelligence audit",
            preheader: "Last chance to see how you compare to competitors",
            template: `{{firstName}},

I'm finishing up marketing intelligence audits this quarter and wanted to give you one last opportunity.

**What you'd get:**
- Complete competitive analysis: {{companyName}} vs {{competitors}}
- Marketing attribution gaps costing you money
- 3 specific optimizations worth ${{optimizationValue}}+ annually
- Predictive insights for Q1 planning

**Investment:** 20 minutes of your time
**Typical value:** ${{typicalValue}} in actionable insights

I realize you're busy, and maybe your current marketing data is giving you everything you need.

But if there's even a 10% chance you're making decisions on incomplete data, the audit could pay for itself 100x over.

**Final call:** Worth 20 minutes to eliminate marketing blind spots?

Either way, no worries at all!

Best,
Gabriele

---
P.S. After Q4, I'm booked solid until March. But if timing isn't right now, I completely understand - we can reconnect in 2025! 📅`
        }
    }
};

// ====================================================================
// COLD EMAIL AUTOMATION ENGINE
// ====================================================================

class ColdEmailSystem {
    constructor(config) {
        this.config = config;
        this.templates = ColdEmailTemplates;
        this.prospects = [];
        this.campaigns = [];
    }

    // Add prospects to campaign
    addProspects(prospectList, sequenceType) {
        const sequence = this.templates[sequenceType];
        if (!sequence) {
            throw new Error(`Sequence type ${sequenceType} not found`);
        }

        prospectList.forEach(prospect => {
            const enrichedProspect = {
                ...prospect,
                sequenceType,
                currentEmailIndex: 0,
                status: 'active',
                addedDate: new Date(),
                lastEmailSent: null,
                opened: [],
                clicked: [],
                replied: false
            };
            
            this.prospects.push(enrichedProspect);
        });

        return this.prospects.length;
    }

    // Generate personalized email
    generateEmail(prospect, emailIndex) {
        const sequence = this.templates[prospect.sequenceType];
        const emailTemplate = sequence[`email${emailIndex + 1}`];
        
        if (!emailTemplate) {
            return null;
        }

        // Personalization data
        const personalizationData = {
            ...prospect,
            ...this.generatePersonalizationInsights(prospect)
        };

        // Replace all template variables
        const personalizedSubject = this.replacePlaceholders(emailTemplate.subject, personalizationData);
        const personalizedContent = this.replacePlaceholders(emailTemplate.template, personalizationData);

        return {
            to: prospect.email,
            subject: personalizedSubject,
            content: personalizedContent,
            preheader: emailTemplate.preheader,
            prospectId: prospect.id,
            emailIndex: emailIndex,
            sequenceType: prospect.sequenceType
        };
    }

    // Replace template placeholders
    replacePlaceholders(template, data) {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] || match;
        });
    }

    // Generate dynamic personalization insights
    generatePersonalizationInsights(prospect) {
        // This would normally integrate with data APIs
        return {
            estimatedLoss: this.calculateEstimatedLoss(prospect),
            emailVolume: this.estimateEmailVolume(prospect),
            hoursWasted: this.calculateHoursWasted(prospect),
            deliverabilityLoss: this.estimateDeliverabilityLoss(prospect),
            industryROI: this.getIndustryROI(prospect.industry),
            competitorEngagement: this.getCompetitorData(prospect.competitors),
            monthlyWaste: this.calculateMonthlyWaste(prospect),
            revenueGap: this.calculateRevenueGap(prospect)
        };
    }

    // Campaign scheduling and management
    scheduleCampaign(campaignName, sequenceType, sendDays) {
        const campaign = {
            id: this.generateCampaignId(),
            name: campaignName,
            sequenceType: sequenceType,
            sendDays: sendDays,
            status: 'scheduled',
            createdDate: new Date(),
            totalProspects: 0,
            emailsSent: 0,
            opens: 0,
            clicks: 0,
            replies: 0
        };

        this.campaigns.push(campaign);
        return campaign;
    }

    // Email validation before sending
    async validateProspectEmails(prospects) {
        const validatedProspects = [];
        
        for (const prospect of prospects) {
            const isValid = await this.validateEmail(prospect.email);
            if (isValid.isValid) {
                validatedProspects.push({
                    ...prospect,
                    emailValidation: isValid
                });
            } else {
                console.log(`Skipping invalid email: ${prospect.email} - ${isValid.reason}`);
            }
        }

        return validatedProspects;
    }

    // Email validation using your DNS system
    async validateEmail(email) {
        // This would use your email validation system
        const domain = email.split('@')[1];
        
        try {
            // Simulate DNS validation
            const mxRecord = await this.checkMXRecord(domain);
            return {
                isValid: mxRecord.valid,
                reason: mxRecord.reason,
                confidence: mxRecord.confidence
            };
        } catch (error) {
            return {
                isValid: false,
                reason: 'Validation error',
                confidence: 0
            };
        }
    }

    // Helper methods for calculations
    calculateEstimatedLoss(prospect) {
        const baseWaste = prospect.companySize > 500 ? 15000 : 
                         prospect.companySize > 100 ? 8000 : 3000;
        return baseWaste + Math.floor(Math.random() * 5000);
    }

    estimateEmailVolume(prospect) {
        return prospect.companySize > 500 ? '50K' :
               prospect.companySize > 100 ? '25K' : '10K';
    }

    generateCampaignId() {
        return 'campaign_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }
}

// ====================================================================
// PROSPECT DATA STRUCTURE
// ====================================================================

const ProspectTemplate = {
    // Required fields
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    title: '',
    
    // Optional enrichment fields
    industry: '',
    companySize: 0,
    companyRevenue: '',
    location: '',
    
    // Personalization data
    competitors: [],
    mainCompetitor: '',
    recentNews: '',
    painPoints: [],
    
    // Tracking fields
    linkedinUrl: '',
    companyWebsite: '',
    source: '',
    addedDate: new Date(),
    lastResearched: new Date()
};

// ====================================================================
// USAGE EXAMPLES
// ====================================================================

// Initialize cold email system
const coldEmailSystem = new ColdEmailSystem({
    fromEmail: 'info@tanzitech.com',
    fromName: 'Gabriele Tanzi',
    replyTo: 'info@tanzitech.com',
    trackingDomain: 'tanzitech.com'
});

// Example prospect data
const sampleProspects = [
    {
        id: 'prospect_001',
        firstName: 'Sarah',
        lastName: 'Johnson', 
        email: 'sarah.johnson@techcorp.com',
        companyName: 'TechCorp Inc',
        title: 'VP of Marketing',
        industry: 'SaaS',
        companySize: 250,
        companyRevenue: '$10M-50M',
        competitors: ['CompetitorA', 'CompetitorB'],
        mainCompetitor: 'CompetitorA',
        painPoints: ['email deliverability', 'attribution tracking']
    },
    {
        id: 'prospect_002',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'mchen@emailcorp.io',
        companyName: 'EmailCorp',
        title: 'CTO',
        industry: 'Email Marketing',
        companySize: 150,
        companyRevenue: '$5M-20M',
        competitors: ['MailChimp', 'ConvertKit'],
        mainCompetitor: 'MailChimp',
        painPoints: ['email validation speed', 'infrastructure scaling']
    }
];

// Add prospects to campaigns
coldEmailSystem.addProspects(
    sampleProspects.filter(p => p.title.includes('Marketing')), 
    'socialMediaSequence'
);

coldEmailSystem.addProspects(
    sampleProspects.filter(p => p.title.includes('CTO') || p.title.includes('Technical')), 
    'emailValidationSequence'
);

// Generate sample emails
const sampleEmail = coldEmailSystem.generateEmail(sampleProspects[0], 0);
console.log('Generated Email:', sampleEmail);

module.exports = {
    ColdEmailTemplates,
    ColdEmailSystem,
    ProspectTemplate
};
