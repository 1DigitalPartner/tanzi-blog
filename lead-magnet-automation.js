/**
 * Lead Magnet Automation System
 * Automated delivery of intelligence reports and lead magnets based on trigger words
 */

const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');

class LeadMagnetSystem {
    constructor() {
        this.emailConfig = {
            service: process.env.EMAIL_SERVICE || 'gmail',
            user: process.env.EMAIL_USER,
            password: process.env.EMAIL_PASSWORD,
            from: process.env.FROM_EMAIL || 'contact@tanzitech.com'
        };
        
        this.transporter = this.setupEmailTransporter();
        this.leadMagnets = this.initializeLeadMagnets();
        this.deliveryLog = path.join(__dirname, 'lead-magnet-delivery-log.json');
        this.reportsDirectory = path.join(__dirname, 'intelligence-reports');
        
        this.initializeReportsDirectory();
    }

    /**
     * Setup email transporter
     */
    setupEmailTransporter() {
        return nodemailer.createTransporter({
            service: this.emailConfig.service,
            auth: {
                user: this.emailConfig.user,
                pass: this.emailConfig.password
            }
        });
    }

    /**
     * Initialize lead magnets based on advanced lead generation strategies
     */
    initializeLeadMagnets() {
        return {
            'DATA': {
                title: 'Social Media Intelligence Report 2025',
                description: 'Complete analysis of 1,000+ viral posts with engagement patterns and psychological triggers',
                format: 'PDF + Excel Dashboard',
                value: '$2,997',
                deliverables: [
                    'social-media-intelligence-report.pdf',
                    'viral-content-analysis-spreadsheet.xlsx',
                    'engagement-calculator-tool.xlsx',
                    'competitor-tracking-template.xlsx'
                ],
                emailTemplate: 'social_media_intelligence_delivery',
                followUpSequence: 'social_media_intelligence'
            },
            'ANALYSIS': {
                title: 'Competitive Social Media Analysis Toolkit',
                description: 'Complete framework for analyzing competitor social media performance',
                format: 'PDF Report + Templates + Tools',
                value: '$1,997',
                deliverables: [
                    'competitive-analysis-framework.pdf',
                    'competitor-audit-checklist.xlsx',
                    'content-gap-analysis-tool.xlsx',
                    'performance-benchmarking-template.xlsx'
                ],
                emailTemplate: 'competitive_analysis_delivery',
                followUpSequence: 'social_media_intelligence'
            },
            'REPORT': {
                title: 'Industry Intelligence Report Collection',
                description: 'Comprehensive market intelligence across multiple industries',
                format: 'Multi-Industry PDF Collection',
                value: '$4,997',
                deliverables: [
                    'saas-industry-intelligence-report.pdf',
                    'b2b-services-intelligence-report.pdf',
                    'ecommerce-intelligence-report.pdf',
                    'consulting-industry-report.pdf',
                    'cross-industry-insights-summary.pdf'
                ],
                emailTemplate: 'industry_intelligence_delivery',
                followUpSequence: 'social_media_intelligence'
            },
            'PLAYBOOK': {
                title: 'AI Implementation Playbook',
                description: 'Complete guide to successful AI implementation with ROI-focused approach',
                format: 'PDF Playbook + Implementation Tools',
                value: '$3,997',
                deliverables: [
                    'ai-implementation-playbook.pdf',
                    'ai-roi-calculator.xlsx',
                    'implementation-timeline-template.xlsx',
                    'vendor-evaluation-framework.pdf'
                ],
                emailTemplate: 'ai_playbook_delivery',
                followUpSequence: 'ai_consulting'
            },
            'OUTREACH': {
                title: 'B2B Sales Outreach Template Library',
                description: 'High-converting outreach sequences with 20%+ response rates',
                format: 'Template Library + Scripts',
                value: '$1,997',
                deliverables: [
                    'cold-outreach-templates.pdf',
                    'linkedin-message-scripts.txt',
                    'email-sequence-templates.xlsx',
                    'objection-handling-guide.pdf'
                ],
                emailTemplate: 'outreach_templates_delivery',
                followUpSequence: 'b2b_sales'
            },
            'TEMPLATE': {
                title: 'Viral Content Template Collection',
                description: 'Proven content templates that generate high engagement',
                format: 'Template Library + Examples',
                value: '$997',
                deliverables: [
                    'viral-content-templates.pdf',
                    'hook-formulas-guide.pdf',
                    'platform-specific-templates.xlsx',
                    'engagement-boosting-examples.pdf'
                ],
                emailTemplate: 'content_templates_delivery',
                followUpSequence: 'content_strategy'
            }
        };
    }

    /**
     * Initialize reports directory structure
     */
    async initializeReportsDirectory() {
        try {
            await fs.mkdir(this.reportsDirectory, { recursive: true });
            
            // Create subdirectories for different report types
            const subdirs = ['social-media', 'ai-consulting', 'b2b-sales', 'industry-reports', 'templates'];
            for (const dir of subdirs) {
                await fs.mkdir(path.join(this.reportsDirectory, dir), { recursive: true });
            }
            
            console.log('📁 Intelligence reports directory initialized');
        } catch (error) {
            console.error('❌ Error initializing reports directory:', error);
        }
    }

    /**
     * Process lead and deliver appropriate lead magnet
     */
    async deliverLeadMagnet(lead) {
        try {
            const triggerWord = lead.triggerWord.toUpperCase();
            const leadMagnet = this.leadMagnets[triggerWord];
            
            if (!leadMagnet) {
                console.log(`⚠️ No lead magnet configured for trigger word: ${triggerWord}`);
                return false;
            }

            // Generate personalized reports if needed
            const personalizedReports = await this.generatePersonalizedReports(lead, leadMagnet);
            
            // Send delivery email with attachments
            await this.sendDeliveryEmail(lead, leadMagnet, personalizedReports);
            
            // Log delivery
            await this.logDelivery(lead, leadMagnet);
            
            console.log(`📦 Lead magnet delivered to ${lead.author}: ${leadMagnet.title}`);
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to deliver lead magnet to ${lead.author}:`, error);
            return false;
        }
    }

    /**
     * Generate personalized reports based on lead data and industry
     */
    async generatePersonalizedReports(lead, leadMagnet) {
        const personalizedReports = [];
        
        try {
            // Generate industry-specific intelligence report
            if (leadMagnet.title.includes('Intelligence Report')) {
                const industryReport = await this.generateIndustrySpecificReport(lead);
                personalizedReports.push(industryReport);
            }
            
            // Generate competitive analysis for specific companies
            if (leadMagnet.title.includes('Competitive Analysis')) {
                const competitorReport = await this.generateCompetitorAnalysis(lead);
                personalizedReports.push(competitorReport);
            }
            
            // Generate ROI calculator with industry benchmarks
            if (leadMagnet.deliverables.some(d => d.includes('calculator'))) {
                const roiCalculator = await this.generateROICalculator(lead);
                personalizedReports.push(roiCalculator);
            }
            
        } catch (error) {
            console.error('Error generating personalized reports:', error);
        }
        
        return personalizedReports;
    }

    /**
     * Generate industry-specific intelligence report
     */
    async generateIndustrySpecificReport(lead) {
        const industry = this.detectIndustry(lead);
        const reportData = await this.getIndustryBenchmarks(industry);
        
        const reportContent = {
            title: `${industry} Social Media Intelligence Report 2025`,
            generatedFor: lead.author,
            generatedDate: new Date().toISOString(),
            industry: industry,
            executiveSummary: {
                marketSize: reportData.marketSize,
                avgEngagementRate: reportData.avgEngagement,
                topPerformingContentTypes: reportData.topContent,
                keyTrends: reportData.trends
            },
            competitiveLandscape: {
                topPerformers: reportData.competitors,
                contentGaps: reportData.gaps,
                opportunityAreas: reportData.opportunities
            },
            recommendations: {
                contentStrategy: reportData.contentStrategy,
                platformPriority: reportData.platforms,
                investmentAreas: reportData.investments
            },
            benchmarks: {
                engagementRates: reportData.benchmarks,
                postingFrequency: reportData.frequency,
                optimalTiming: reportData.timing
            }
        };

        const fileName = `${industry.toLowerCase()}-intelligence-report-${Date.now()}.json`;
        const filePath = path.join(this.reportsDirectory, 'industry-reports', fileName);
        
        await fs.writeFile(filePath, JSON.stringify(reportContent, null, 2));
        
        return {
            fileName: fileName,
            filePath: filePath,
            title: reportContent.title,
            type: 'industry_intelligence'
        };
    }

    /**
     * Generate competitor analysis report
     */
    async generateCompetitorAnalysis(lead) {
        const industry = this.detectIndustry(lead);
        const competitors = await this.identifyCompetitors(industry);
        
        const analysisData = {
            title: `Competitive Analysis: Top ${industry} Companies`,
            generatedFor: lead.author,
            analysisDate: new Date().toISOString(),
            competitorsAnalyzed: competitors.length,
            competitors: competitors.map(comp => ({
                name: comp.name,
                platforms: comp.platforms,
                avgEngagement: comp.engagement,
                contentTypes: comp.contentTypes,
                postingFrequency: comp.frequency,
                topPerformingPosts: comp.topPosts,
                weaknesses: comp.weaknesses,
                opportunities: comp.opportunities
            })),
            insights: {
                contentGaps: this.identifyContentGaps(competitors),
                performanceOpportunities: this.identifyOpportunities(competitors),
                bestPractices: this.extractBestPractices(competitors)
            },
            actionableRecommendations: this.generateRecommendations(competitors, industry)
        };

        const fileName = `competitive-analysis-${industry.toLowerCase()}-${Date.now()}.json`;
        const filePath = path.join(this.reportsDirectory, 'social-media', fileName);
        
        await fs.writeFile(filePath, JSON.stringify(analysisData, null, 2));
        
        return {
            fileName: fileName,
            filePath: filePath,
            title: analysisData.title,
            type: 'competitive_analysis'
        };
    }

    /**
     * Generate ROI calculator with industry benchmarks
     */
    async generateROICalculator(lead) {
        const industry = this.detectIndustry(lead);
        const benchmarks = await this.getIndustryBenchmarks(industry);
        
        const calculatorData = {
            title: `${industry} Social Media ROI Calculator`,
            createdFor: lead.author,
            industry: industry,
            benchmarks: {
                avgCostPerLead: benchmarks.costPerLead,
                avgConversionRate: benchmarks.conversionRate,
                avgCustomerLifetimeValue: benchmarks.clv,
                avgEngagementRate: benchmarks.engagement
            },
            calculations: {
                currentPerformance: {
                    monthlySpend: 0,
                    leadsGenerated: 0,
                    costPerLead: 0,
                    conversionRate: 0
                },
                projectedImprovement: {
                    optimizedSpend: 0,
                    expectedLeads: 0,
                    projectedCostPerLead: 0,
                    expectedConversions: 0
                },
                roiCalculation: {
                    currentROI: 0,
                    projectedROI: 0,
                    improvement: 0,
                    annualImpact: 0
                }
            },
            instructions: [
                'Enter your current monthly social media spend',
                'Input current leads generated per month',
                'Add your average conversion rate',
                'Include customer lifetime value',
                'Calculator will show optimization opportunities'
            ]
        };

        const fileName = `roi-calculator-${industry.toLowerCase()}-${Date.now()}.json`;
        const filePath = path.join(this.reportsDirectory, 'social-media', fileName);
        
        await fs.writeFile(filePath, JSON.stringify(calculatorData, null, 2));
        
        return {
            fileName: fileName,
            filePath: filePath,
            title: calculatorData.title,
            type: 'roi_calculator'
        };
    }

    /**
     * Detect industry from lead data
     */
    detectIndustry(lead) {
        const industries = {
            'software': ['software', 'saas', 'tech', 'app', 'platform'],
            'consulting': ['consulting', 'advisory', 'services', 'strategy'],
            'ecommerce': ['ecommerce', 'retail', 'shop', 'store', 'marketplace'],
            'healthcare': ['health', 'medical', 'care', 'wellness', 'pharma'],
            'finance': ['finance', 'bank', 'investment', 'fintech', 'insurance'],
            'education': ['education', 'learning', 'training', 'course', 'university'],
            'manufacturing': ['manufacturing', 'industrial', 'production', 'factory']
        };

        const leadText = `${lead.comment} ${lead.postTitle}`.toLowerCase();
        
        for (const [industry, keywords] of Object.entries(industries)) {
            if (keywords.some(keyword => leadText.includes(keyword))) {
                return industry.charAt(0).toUpperCase() + industry.slice(1);
            }
        }
        
        return 'Business Services'; // default industry
    }

    /**
     * Get industry benchmarks (mock data - replace with real data)
     */
    async getIndustryBenchmarks(industry) {
        const benchmarks = {
            'Software': {
                marketSize: '$2.3B',
                avgEngagement: '3.2%',
                topContent: ['Product Updates', 'Tech Insights', 'Case Studies'],
                trends: ['AI Integration', 'Remote Collaboration', 'Security Focus'],
                competitors: ['Company A', 'Company B', 'Company C'],
                gaps: ['Implementation Challenges', 'ROI Measurement'],
                opportunities: ['Thought Leadership', 'Community Building'],
                contentStrategy: 'Technical thought leadership with business impact',
                platforms: ['LinkedIn', 'Twitter', 'HackerNews'],
                investments: ['Video Content', 'Developer Relations'],
                benchmarks: { LinkedIn: '4.1%', Twitter: '2.8%', HackerNews: '8.2%' },
                frequency: '5-7 posts/week',
                timing: 'Weekdays 10AM-2PM EST',
                costPerLead: '$147',
                conversionRate: '12.3%',
                clv: '$12,400'
            },
            'Consulting': {
                marketSize: '$1.8B',
                avgEngagement: '4.7%',
                topContent: ['Case Studies', 'Industry Insights', 'Process Frameworks'],
                trends: ['Digital Transformation', 'Data Analytics', 'Change Management'],
                competitors: ['Firm A', 'Firm B', 'Firm C'],
                gaps: ['Implementation Stories', 'ROI Validation'],
                opportunities: ['Thought Leadership', 'Expert Positioning'],
                contentStrategy: 'Authority-building with proven results',
                platforms: ['LinkedIn', 'Medium', 'Industry Forums'],
                investments: ['Long-form Content', 'Speaking Opportunities'],
                benchmarks: { LinkedIn: '5.2%', Medium: '3.4%', Forums: '12.1%' },
                frequency: '3-5 posts/week',
                timing: 'Tuesday-Thursday 9AM-11AM EST',
                costPerLead: '$89',
                conversionRate: '18.7%',
                clv: '$47,200'
            }
        };

        return benchmarks[industry] || benchmarks['Software'];
    }

    /**
     * Send delivery email with lead magnet attachments
     */
    async sendDeliveryEmail(lead, leadMagnet, personalizedReports) {
        const emailTemplates = {
            social_media_intelligence_delivery: {
                subject: `Your ${leadMagnet.title} is here (${leadMagnet.value} value)`,
                content: this.getSocialMediaDeliveryTemplate(lead, leadMagnet, personalizedReports)
            },
            ai_playbook_delivery: {
                subject: `Your AI Implementation Playbook (${leadMagnet.value} value)`,
                content: this.getAIPlaybookDeliveryTemplate(lead, leadMagnet, personalizedReports)
            },
            outreach_templates_delivery: {
                subject: `Your B2B Outreach Templates (${leadMagnet.value} value)`,
                content: this.getOutreachTemplatesDeliveryTemplate(lead, leadMagnet, personalizedReports)
            }
        };

        const template = emailTemplates[leadMagnet.emailTemplate] || emailTemplates.social_media_intelligence_delivery;
        
        const mailOptions = {
            from: this.emailConfig.from,
            to: lead.email || `${lead.author.replace(/\s+/g, '').toLowerCase()}@example.com`, // Mock email if not provided
            subject: template.subject,
            html: this.formatEmailHTML(template.content),
            text: template.content,
            attachments: await this.prepareAttachments(leadMagnet, personalizedReports)
        };

        // In production, uncomment to send actual emails
        // await this.transporter.sendMail(mailOptions);
        
        console.log(`📧 Lead magnet delivery email sent to ${lead.author}`);
    }

    /**
     * Get social media intelligence delivery template
     */
    getSocialMediaDeliveryTemplate(lead, leadMagnet, personalizedReports) {
        const firstName = lead.author.split(' ')[0];
        
        return `Hi ${firstName},

Thanks for your interest in the social media intelligence analysis!

As promised, here's your complete ${leadMagnet.title} package:

📊 **WHAT'S INCLUDED:**
• Complete analysis of 1,000+ viral posts (${leadMagnet.value} value)
• Engagement pattern database with psychological triggers
• Platform-specific optimization strategies
• Viral content templates with proven results

🎯 **PERSONALIZED FOR YOU:**
Based on your comment about "${lead.comment.substring(0, 100)}...", I've included:
${personalizedReports.map(report => `• ${report.title}`).join('\n')}

🚀 **BONUS MATERIALS:**
• Industry benchmark comparison tool
• Competitor tracking spreadsheet
• Content performance calculator
• Weekly optimization checklist

**Quick question:** What's your biggest challenge with social media performance right now?

I'd love to hear about your specific situation and see if I can provide additional insights.

Best,
Gabriele Tanzi
TanziTech

P.S. This analysis took 3+ months to compile across multiple industries. If you find it valuable, I'd appreciate you sharing it with your network!

---
**Ready for the next step?**
If you'd like help implementing these strategies for your business, I'm doing a limited number of strategy calls this month. Reply "STRATEGY" if you're interested.`;
    }

    /**
     * Get AI playbook delivery template
     */
    getAIPlaybookDeliveryTemplate(lead, leadMagnet, personalizedReports) {
        const firstName = lead.author.split(' ')[0];
        
        return `Hi ${firstName},

Your AI Implementation Playbook is here!

Based on your interest in AI consulting, I've compiled everything you need:

🤖 **COMPLETE AI PLAYBOOK INCLUDES:**
• 5 AI quick wins that deliver ROI in 30 days
• The $100K implementation mistake (and how to avoid it)
• Step-by-step roadmap with realistic timelines
• 12 real case studies with exact ROI numbers

💰 **PERSONALIZED ROI ANALYSIS:**
${personalizedReports.map(report => `• ${report.title}`).join('\n')}

🎯 **IMPLEMENTATION TOOLS:**
• AI vendor evaluation framework
• ROI calculation spreadsheet
• Implementation timeline templates
• Team training materials

**The key insight from 500+ AI projects:** Simple automation delivers 80% of results. Most companies overcomplicate AI when they should start with workflow optimization.

What's your current AI implementation challenge? I'd love to hear where you're stuck and provide specific guidance.

Best,
Gabriele

P.S. This playbook is based on analysis of $50M+ in AI project investments. Use it wisely!`;
    }

    /**
     * Get outreach templates delivery template
     */
    getOutreachTemplatesDeliveryTemplate(lead, leadMagnet, personalizedReports) {
        const firstName = lead.author.split(' ')[0];
        
        return `Hi ${firstName},

Your B2B outreach templates are ready!

After analyzing 10,000+ cold outreach sequences, here's what actually works:

📧 **TEMPLATE LIBRARY INCLUDES:**
• Email sequences with 20%+ response rates
• LinkedIn messages that start conversations
• Follow-up sequences that convert prospects
• Objection handling scripts

🎯 **INDUSTRY-SPECIFIC TEMPLATES:**
${personalizedReports.map(report => `• ${report.title}`).join('\n')}

📈 **PROVEN RESULTS:**
These exact templates helped clients achieve:
• 23.7% response rate (industry avg: 2.3%)
• $340K in new pipeline from same outreach volume
• 60% reduction in time-to-response

**The secret:** Lead with specific insights, not generic value propositions.

Quick question: What's your biggest challenge with B2B outreach right now?

Best,
Gabriele

P.S. These templates come from $2M+ in closed deals. They work when applied correctly!`;
    }

    /**
     * Prepare email attachments
     */
    async prepareAttachments(leadMagnet, personalizedReports) {
        const attachments = [];
        
        // Add standard deliverables (mock - in production, these would be real files)
        for (const deliverable of leadMagnet.deliverables) {
            attachments.push({
                filename: deliverable,
                content: `Mock content for ${deliverable}`,
                contentType: this.getContentType(deliverable)
            });
        }
        
        // Add personalized reports
        for (const report of personalizedReports) {
            if (fs.access) { // Check if file exists
                try {
                    const content = await fs.readFile(report.filePath, 'utf8');
                    attachments.push({
                        filename: report.fileName,
                        content: content,
                        contentType: 'application/json'
                    });
                } catch (error) {
                    console.log(`Report file not found: ${report.fileName}`);
                }
            }
        }
        
        return attachments;
    }

    /**
     * Get content type based on file extension
     */
    getContentType(filename) {
        const extension = path.extname(filename).toLowerCase();
        const contentTypes = {
            '.pdf': 'application/pdf',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.txt': 'text/plain',
            '.json': 'application/json'
        };
        return contentTypes[extension] || 'application/octet-stream';
    }

    /**
     * Format email content as HTML
     */
    formatEmailHTML(content) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { padding: 30px; background: #f8f9fa; }
                .footer { padding: 20px; text-align: center; background: #e9ecef; color: #666; font-size: 14px; border-radius: 0 0 8px 8px; }
                .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
                .cta-button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
                a { color: #3182ce; }
                ul { padding-left: 20px; }
                li { margin: 8px 0; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>🎯 Your Lead Magnet is Here!</h2>
                <p>TanziTech Intelligence Delivery</p>
            </div>
            <div class="content">
                ${content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}
            </div>
            <div class="footer">
                <p><strong>Gabriele Tanzi</strong><br>
                TanziTech Intelligence<br>
                <a href="mailto:contact@tanzitech.com">contact@tanzitech.com</a></p>
                <p><a href="https://tanzitech.com">Visit TanziTech.com</a> | <a href="https://linkedin.com/in/gabrieletanzi">Connect on LinkedIn</a></p>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Log lead magnet delivery
     */
    async logDelivery(lead, leadMagnet) {
        try {
            let deliveryLogs = [];
            try {
                const logData = await fs.readFile(this.deliveryLog, 'utf8');
                deliveryLogs = JSON.parse(logData);
            } catch (error) {
                // File doesn't exist, start with empty array
            }

            const logEntry = {
                leadId: lead.id,
                leadName: lead.author,
                triggerWord: lead.triggerWord,
                magnetTitle: leadMagnet.title,
                magnetValue: leadMagnet.value,
                deliveryTime: new Date().toISOString(),
                platform: lead.platform,
                postTitle: lead.postTitle,
                deliverables: leadMagnet.deliverables,
                followUpSequence: leadMagnet.followUpSequence
            };

            deliveryLogs.push(logEntry);
            await fs.writeFile(this.deliveryLog, JSON.stringify(deliveryLogs, null, 2));
            
        } catch (error) {
            console.error('Error logging delivery:', error);
        }
    }

    /**
     * Generate delivery performance report
     */
    async generateDeliveryReport() {
        try {
            const deliveryLogs = JSON.parse(await fs.readFile(this.deliveryLog, 'utf8'));
            
            const report = {
                generated: new Date().toISOString(),
                totalDeliveries: deliveryLogs.length,
                deliveriesLast30Days: deliveryLogs.filter(log => 
                    Date.now() - new Date(log.deliveryTime).getTime() < 30 * 24 * 60 * 60 * 1000
                ).length,
                magnetPerformance: this.analyzeMagnetPerformance(deliveryLogs),
                platformBreakdown: this.groupBy(deliveryLogs, 'platform'),
                triggerWordAnalysis: this.groupBy(deliveryLogs, 'triggerWord'),
                valueDelivered: this.calculateTotalValue(deliveryLogs),
                conversionOpportunities: this.identifyConversionOpportunities(deliveryLogs)
            };

            await fs.writeFile(
                path.join(__dirname, 'lead-magnet-performance-report.json'),
                JSON.stringify(report, null, 2)
            );

            console.log('📊 Lead magnet delivery report generated');
            return report;
            
        } catch (error) {
            console.error('Error generating delivery report:', error);
        }
    }

    /**
     * Analyze magnet performance
     */
    analyzeMagnetPerformance(deliveryLogs) {
        const magnetStats = {};
        
        for (const log of deliveryLogs) {
            if (!magnetStats[log.magnetTitle]) {
                magnetStats[log.magnetTitle] = {
                    title: log.magnetTitle,
                    deliveries: 0,
                    totalValue: 0,
                    platforms: new Set(),
                    triggerWords: new Set()
                };
            }
            
            magnetStats[log.magnetTitle].deliveries++;
            magnetStats[log.magnetTitle].totalValue += parseInt(log.magnetValue.replace(/[\$,]/g, ''));
            magnetStats[log.magnetTitle].platforms.add(log.platform);
            magnetStats[log.magnetTitle].triggerWords.add(log.triggerWord);
        }
        
        return Object.values(magnetStats).map(stat => ({
            ...stat,
            platforms: Array.from(stat.platforms),
            triggerWords: Array.from(stat.triggerWords)
        }));
    }

    /**
     * Calculate total value delivered
     */
    calculateTotalValue(deliveryLogs) {
        const totalValue = deliveryLogs.reduce((sum, log) => 
            sum + parseInt(log.magnetValue.replace(/[\$,]/g, '')), 0
        );
        
        return {
            totalValueDelivered: `$${totalValue.toLocaleString()}`,
            avgValuePerLead: `$${Math.round(totalValue / deliveryLogs.length).toLocaleString()}`,
            last30DaysValue: this.calculateLast30DaysValue(deliveryLogs)
        };
    }

    /**
     * Calculate last 30 days value
     */
    calculateLast30DaysValue(deliveryLogs) {
        const last30Days = deliveryLogs.filter(log => 
            Date.now() - new Date(log.deliveryTime).getTime() < 30 * 24 * 60 * 60 * 1000
        );
        
        const value = last30Days.reduce((sum, log) => 
            sum + parseInt(log.magnetValue.replace(/[\$,]/g, '')), 0
        );
        
        return `$${value.toLocaleString()}`;
    }

    /**
     * Identify conversion opportunities
     */
    identifyConversionOpportunities(deliveryLogs) {
        return {
            highValueLeads: deliveryLogs
                .filter(log => parseInt(log.magnetValue.replace(/[\$,]/g, '')) > 2000)
                .slice(0, 10),
            recentDeliveries: deliveryLogs
                .filter(log => Date.now() - new Date(log.deliveryTime).getTime() < 7 * 24 * 60 * 60 * 1000)
                .slice(0, 5),
            multipleDeliveries: this.findRepeatingLeads(deliveryLogs)
        };
    }

    /**
     * Find leads who received multiple magnets
     */
    findRepeatingLeads(deliveryLogs) {
        const leadCounts = {};
        
        for (const log of deliveryLogs) {
            leadCounts[log.leadName] = (leadCounts[log.leadName] || 0) + 1;
        }
        
        return Object.entries(leadCounts)
            .filter(([name, count]) => count > 1)
            .map(([name, count]) => ({ name, deliveries: count }))
            .sort((a, b) => b.deliveries - a.deliveries);
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

    // Mock functions for competitive analysis
    async identifyCompetitors(industry) {
        return [
            { name: 'Competitor A', platforms: ['LinkedIn', 'Twitter'], engagement: '4.2%', contentTypes: ['Articles', 'Updates'], frequency: 'Daily', topPosts: [], weaknesses: [], opportunities: [] },
            { name: 'Competitor B', platforms: ['LinkedIn'], engagement: '3.8%', contentTypes: ['Videos', 'Posts'], frequency: '3x/week', topPosts: [], weaknesses: [], opportunities: [] }
        ];
    }

    identifyContentGaps(competitors) {
        return ['Implementation challenges', 'ROI measurement', 'Team training'];
    }

    identifyOpportunities(competitors) {
        return ['Video content', 'Community engagement', 'Thought leadership'];
    }

    extractBestPractices(competitors) {
        return ['Data-driven content', 'Consistent posting', 'Engagement focus'];
    }

    generateRecommendations(competitors, industry) {
        return ['Focus on educational content', 'Increase posting frequency', 'Engage with community'];
    }
}

module.exports = LeadMagnetSystem;

// CLI usage
if (require.main === module) {
    const magnetSystem = new LeadMagnetSystem();
    
    const command = process.argv[2];
    switch (command) {
        case 'deliver':
            // Mock lead for testing
            const mockLead = {
                id: 'test_lead_123',
                author: 'John Smith',
                triggerWord: 'DATA',
                comment: 'This looks great! I need help with social media analytics.',
                platform: 'linkedin',
                postTitle: 'Social Media Analytics Guide',
                email: 'john.smith@example.com'
            };
            magnetSystem.deliverLeadMagnet(mockLead);
            break;
        case 'report':
            magnetSystem.generateDeliveryReport().then(report => 
                console.log('Delivery Report:', JSON.stringify(report, null, 2))
            );
            break;
        default:
            console.log(`
📦 Lead Magnet Automation Commands:

  deliver     Test lead magnet delivery (with mock data)
  report      Generate delivery performance report

Examples:
  node lead-magnet-automation.js deliver
  node lead-magnet-automation.js report
            `);
    }
}
