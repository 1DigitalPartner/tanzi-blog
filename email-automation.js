// ====================================================================
// EMAIL AUTOMATION SYSTEM
// Comprehensive email sequences for user engagement and conversion
// ====================================================================

class EmailAutomationSystem {
    constructor() {
        this.emailQueue = JSON.parse(localStorage.getItem('email_queue') || '[]');
        this.subscribers = JSON.parse(localStorage.getItem('email_subscribers') || '[]');
        this.emailTemplates = this.initializeEmailTemplates();
        this.emailSequences = this.initializeEmailSequences();
        this.automationRules = this.initializeAutomationRules();
        this.init();
    }

    // Initialize system
    init() {
        this.processEmailQueue();
        this.checkAutomationTriggers();
        
        // Set up periodic processing
        setInterval(() => {
            this.processEmailQueue();
            this.checkAutomationTriggers();
        }, 30000); // Check every 30 seconds
    }

    // Initialize email templates
    initializeEmailTemplates() {
        return {
            welcome_email: {
                subject: "🎉 Welcome to the TanziTech Community!",
                template: `
                <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <header style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Welcome to TanziTech!</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your journey to marketing mastery starts now</p>
                    </header>
                    
                    <main style="background: white; padding: 40px 30px;">
                        <p style="font-size: 18px; color: #111827; margin-bottom: 20px;">Hi {{firstName}},</p>
                        
                        <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
                            Welcome to the TanziTech community! I'm thrilled to have you join our growing network of marketing professionals who are serious about creating authentic connections and driving real business results.
                        </p>
                        
                        <div style="background: #f3f4f6; padding: 24px; border-radius: 8px; margin: 32px 0;">
                            <h3 style="color: #111827; margin-top: 0;">What's Next?</h3>
                            <ul style="color: #374151; line-height: 1.6; padding-left: 20px;">
                                <li>Download your <strong>Email Validation Toolkit</strong> (link below)</li>
                                <li>Explore our latest blog posts and case studies</li>
                                <li>Join our community discussions</li>
                                <li>{{membershipTier === 'premium' ? 'Access your premium content dashboard' : 'Consider upgrading to premium for advanced resources'}}</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="{{downloadLink}}" style="background: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                                📥 Download Your Toolkit
                            </a>
                        </div>
                        
                        <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
                            Over the next few days, I'll be sharing some of my best strategies and insights directly to your inbox. These aren't generic tips – they're battle-tested methods I've used to help businesses transform their social media presence.
                        </p>
                        
                        <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; margin: 24px 0;">
                            <p style="color: #1e40af; margin: 0; font-style: italic;">
                                "The best time to plant a tree was 20 years ago. The second best time is now." 
                                Your marketing transformation starts today! 🌱
                            </p>
                        </div>
                        
                        <p style="color: #374151; line-height: 1.6;">
                            Ready to dive in? Hit reply and tell me about your biggest marketing challenge right now. I read every email and often feature the best questions in my weekly newsletter.
                        </p>
                        
                        <p style="color: #374151; line-height: 1.6;">
                            Looking forward to supporting your success,<br>
                            <strong>Gabriele Tanzi</strong><br>
                            <em>Founder, TanziTech</em>
                        </p>
                    </main>
                    
                    <footer style="background: #f9fafb; padding: 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
                        <div style="margin-bottom: 20px;">
                            <a href="{{blogUrl}}" style="color: #2563eb; text-decoration: none; margin: 0 10px;">📖 Blog</a>
                            <a href="{{toolsUrl}}" style="color: #2563eb; text-decoration: none; margin: 0 10px;">🛠️ Tools</a>
                            <a href="{{communityUrl}}" style="color: #2563eb; text-decoration: none; margin: 0 10px;">👥 Community</a>
                        </div>
                        <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">
                            TanziTech - Authentic Social Media Marketing<br>
                            <a href="{{unsubscribeUrl}}" style="color: #9ca3af; text-decoration: none;">Unsubscribe</a>
                        </p>
                    </footer>
                </div>
                `
            },

            nurture_day_3: {
                subject: "🎯 The #1 Mistake Killing Your Social Media ROI",
                template: `
                <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <header style="background: #111827; color: white; padding: 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Day 3: Avoiding The ROI Killer</h1>
                    </header>
                    
                    <main style="background: white; padding: 40px 30px;">
                        <p style="font-size: 18px; color: #111827; margin-bottom: 20px;">Hi {{firstName}},</p>
                        
                        <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
                            I've analyzed over 500 social media campaigns in the past year, and there's one mistake I see <strong>constantly</strong> – even from experienced marketers.
                        </p>
                        
                        <div style="background: #fef2f2; border: 1px solid #fca5a5; padding: 20px; border-radius: 8px; margin: 24px 0;">
                            <h3 style="color: #991b1b; margin-top: 0;">❌ The ROI Killer:</h3>
                            <p style="color: #991b1b; margin-bottom: 0; font-weight: 600;">
                                Posting content without understanding your audience's buyer journey stage.
                            </p>
                        </div>
                        
                        <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
                            Here's what happens: You create amazing content, get great engagement, but conversions remain flat. Sound familiar?
                        </p>
                        
                        <h3 style="color: #111827;">The 3-Stage Solution:</h3>
                        
                        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="color: #065f46; margin-top: 0;">🔍 Stage 1: Awareness (Problem-Focused)</h4>
                            <p style="color: #047857; margin-bottom: 0;">Educational content that identifies pain points without selling</p>
                        </div>
                        
                        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="color: #1e40af; margin-top: 0;">💡 Stage 2: Consideration (Solution-Focused)</h4>
                            <p style="color: #2563eb; margin-bottom: 0;">Case studies, comparisons, and proof of concept content</p>
                        </div>
                        
                        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h4 style="color: #92400e; margin-top: 0;">🎯 Stage 3: Decision (Action-Focused)</h4>
                            <p style="color: #d97706; margin-bottom: 0;">Clear CTAs, testimonials, and conversion-optimized content</p>
                        </div>
                        
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="{{contentStrategyGuideUrl}}" style="background: #059669; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                                📋 Get My Content Journey Template
                            </a>
                        </div>
                        
                        <p style="color: #374151; line-height: 1.6;">
                            Tomorrow, I'll show you the exact content framework I use to guide prospects through all three stages seamlessly.
                        </p>
                        
                        <p style="color: #374151; line-height: 1.6;">
                            Talk soon,<br>
                            <strong>Gabriele</strong>
                        </p>
                    </main>
                </div>
                `
            },

            nurture_day_7: {
                subject: "🚀 Case Study: How Sarah Generated $50K in 90 Days",
                template: `
                <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <header style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 26px; font-weight: 700;">Real Results: $50K in 90 Days</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">How one client transformed her business</p>
                    </header>
                    
                    <main style="background: white; padding: 40px 30px;">
                        <p style="font-size: 18px; color: #111827; margin-bottom: 20px;">Hi {{firstName}},</p>
                        
                        <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
                            I want to share a success story that perfectly illustrates the power of strategic social media marketing.
                        </p>
                        
                        <div style="background: #f3f4f6; padding: 24px; border-radius: 12px; margin: 32px 0;">
                            <h3 style="color: #111827; margin-top: 0;">📊 The Numbers:</h3>
                            <ul style="color: #374151; line-height: 1.8; padding-left: 20px;">
                                <li><strong>$50,247</strong> in new revenue</li>
                                <li><strong>127%</strong> increase in qualified leads</li>
                                <li><strong>89%</strong> improvement in engagement rate</li>
                                <li><strong>31</strong> new high-value clients</li>
                            </ul>
                        </div>
                        
                        <h3 style="color: #111827;">The Challenge:</h3>
                        <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
                            Sarah runs a boutique marketing consultancy. She was posting consistently but struggling to convert her audience into paying clients. Her engagement was decent, but her DMs were filled with tire-kickers rather than serious prospects.
                        </p>
                        
                        <h3 style="color: #111827;">The Strategy:</h3>
                        
                        <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; margin: 24px 0;">
                            <h4 style="color: #1e40af; margin-top: 0;">🎯 Phase 1: Audience Audit (Week 1-2)</h4>
                            <p style="color: #2563eb; margin-bottom: 0;">We identified her ideal client profile and refined her messaging to speak directly to CMOs at mid-size B2B companies.</p>
                        </div>
                        
                        <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 20px; margin: 24px 0;">
                            <h4 style="color: #065f46; margin-top: 0;">📝 Phase 2: Content Transformation (Week 3-6)</h4>
                            <p style="color: #047857; margin-bottom: 0;">Shifted from generic tips to specific case studies and actionable frameworks that solved real business problems.</p>
                        </div>
                        
                        <div style="background: #fefbeb; border-left: 4px solid #d97706; padding: 20px; margin: 24px 0;">
                            <h4 style="color: #92400e; margin-top: 0;">🔗 Phase 3: Conversion Optimization (Week 7-12)</h4>
                            <p style="color: #d97706; margin-bottom: 0;">Implemented strategic lead magnets and a nurture sequence that pre-qualified prospects before sales calls.</p>
                        </div>
                        
                        <div style="background: #ecfdf5; padding: 24px; border-radius: 12px; margin: 32px 0; text-align: center;">
                            <h3 style="color: #065f46; margin-top: 0;">💡 The Key Insight:</h3>
                            <p style="color: #047857; font-size: 16px; font-weight: 600; margin-bottom: 0;">
                                "I stopped trying to educate everyone and started having conversations with the right people." - Sarah
                            </p>
                        </div>
                        
                        <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
                            The transformation didn't happen overnight, but by month 3, Sarah's calendar was booked solid with qualified discovery calls, and her close rate jumped from 22% to 67%.
                        </p>
                        
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="{{caseStudyUrl}}" style="background: #059669; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                                📖 Read the Full Case Study
                            </a>
                        </div>
                        
                        <p style="color: #374151; line-height: 1.6;">
                            Want similar results? The same strategy framework that worked for Sarah is available in my Social Media Intelligence Templates.
                        </p>
                        
                        <p style="color: #374151; line-height: 1.6;">
                            Keep pushing forward,<br>
                            <strong>Gabriele</strong>
                        </p>
                    </main>
                </div>
                `
            },

            premium_upgrade: {
                subject: "🔥 Limited Time: Premium Access (48 hours only)",
                template: `
                <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <header style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); color: white; padding: 40px 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 700;">⏰ 48-Hour Flash Offer</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Premium access at 50% off</p>
                    </header>
                    
                    <main style="background: white; padding: 40px 30px;">
                        <p style="font-size: 18px; color: #111827; margin-bottom: 20px;">Hi {{firstName}},</p>
                        
                        <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
                            You've been engaging with my content consistently, and I can see you're serious about transforming your marketing results. 
                        </p>
                        
                        <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 24px; border-radius: 12px; margin: 32px 0; text-align: center;">
                            <h3 style="color: #92400e; margin-top: 0;">⚡ Flash Offer - 48 Hours Only</h3>
                            <p style="color: #d97706; font-size: 18px; font-weight: 600; margin: 16px 0;">
                                Premium Membership: <span style="text-decoration: line-through;">$29/month</span> → <strong>$14.50/month</strong>
                            </p>
                            <p style="color: #92400e; font-size: 14px; margin-bottom: 0;">
                                Save $174 on your first year • Offer expires in 48 hours
                            </p>
                        </div>
                        
                        <h3 style="color: #111827;">What You Get Immediately:</h3>
                        
                        <div style="background: #f9fafb; padding: 24px; border-radius: 8px; margin: 24px 0;">
                            <ul style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0;">
                                <li><strong>Complete Social Media Intelligence Templates</strong> - The exact frameworks that generated Sarah's $50K</li>
                                <li><strong>Advanced Content Calendar System</strong> - Never run out of engaging post ideas again</li>
                                <li><strong>ROI Tracking Dashboard Templates</strong> - Prove your marketing's business impact</li>
                                <li><strong>Weekly Premium Case Studies</strong> - Fresh strategies from real client wins</li>
                                <li><strong>Priority Email Support</strong> - Get answers to your specific challenges</li>
                                <li><strong>Members-Only Webinars</strong> - Monthly deep-dives with Q&A sessions</li>
                            </ul>
                        </div>
                        
                        <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 24px 0;">
                            <h4 style="color: #065f46; margin-top: 0;">💰 ROI Guarantee:</h4>
                            <p style="color: #047857; margin-bottom: 0;">
                                If the Premium resources don't help you generate at least $500 in additional revenue within 90 days, I'll refund every penny. No questions asked.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="{{upgradeUrl}}" style="background: #7c3aed; color: white; padding: 18px 36px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 18px;">
                                🚀 Claim 50% Off Premium Access
                            </a>
                            <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">
                                ⏰ Timer ends in 48 hours • No commitments, cancel anytime
                            </p>
                        </div>
                        
                        <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
                            Here's the thing, {{firstName}}...
                        </p>
                        
                        <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
                            You can keep trying to piece together strategies from free content across the internet, or you can get the complete system that's already working for hundreds of professionals.
                        </p>
                        
                        <p style="color: #374151; line-height: 1.6;">
                            The choice is yours, but this offer expires in exactly 48 hours.
                        </p>
                        
                        <p style="color: #374151; line-height: 1.6;">
                            Ready to accelerate your results?<br>
                            <strong>Gabriele</strong>
                        </p>
                    </main>
                </div>
                `
            },

            reengagement: {
                subject: "👋 We miss you! Here's what you've been missing...",
                template: `
                <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                    <header style="background: #f59e0b; color: white; padding: 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 700;">We Miss You! 👋</h1>
                    </header>
                    
                    <main style="background: white; padding: 40px 30px;">
                        <p style="font-size: 18px; color: #111827; margin-bottom: 20px;">Hi {{firstName}},</p>
                        
                        <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
                            I noticed you haven't engaged with our content lately, and I wanted to personally reach out.
                        </p>
                        
                        <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
                            Maybe you've been busy, or perhaps our content hasn't been hitting the mark for you. Either way, I'd love to get you re-engaged with valuable insights.
                        </p>
                        
                        <div style="background: #eff6ff; padding: 24px; border-radius: 12px; margin: 32px 0;">
                            <h3 style="color: #1e40af; margin-top: 0;">🎯 What You've Missed:</h3>
                            <ul style="color: #2563eb; line-height: 1.8; padding-left: 20px;">
                                <li>New case study: $75K revenue boost in 6 months</li>
                                <li>Updated Social Media ROI Calculator</li>
                                <li>Advanced audience targeting framework</li>
                                <li>Community success stories and wins</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="{{reengageUrl}}" style="background: #f59e0b; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                                📚 Catch Up on Recent Content
                            </a>
                        </div>
                        
                        <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
                            If our emails aren't providing value anymore, I completely understand. You can update your preferences or unsubscribe using the links below.
                        </p>
                        
                        <p style="color: #374151; line-height: 1.6;">
                            But if you're still working on growing your business through social media, I'd love to continue supporting your journey.
                        </p>
                        
                        <p style="color: #374151; line-height: 1.6;">
                            Here to help,<br>
                            <strong>Gabriele</strong>
                        </p>
                    </main>
                </div>
                `
            }
        };
    }

    // Initialize email sequences
    initializeEmailSequences() {
        return {
            welcome_sequence: {
                name: 'Welcome & Onboarding',
                triggers: ['user_registered'],
                emails: [
                    { template: 'welcome_email', delay: 0 }, // Immediate
                    { template: 'nurture_day_3', delay: 3 * 24 * 60 * 60 * 1000 }, // 3 days
                    { template: 'nurture_day_7', delay: 7 * 24 * 60 * 60 * 1000 }, // 7 days
                ]
            },
            premium_conversion: {
                name: 'Premium Upgrade Sequence',
                triggers: ['high_engagement', 'multiple_downloads'],
                emails: [
                    { template: 'premium_upgrade', delay: 0 },
                ]
            },
            reengagement_sequence: {
                name: 'Win-Back Campaign',
                triggers: ['inactive_30_days'],
                emails: [
                    { template: 'reengagement', delay: 0 },
                ]
            }
        };
    }

    // Initialize automation rules
    initializeAutomationRules() {
        return {
            high_engagement: {
                condition: (user) => {
                    const engagementScore = this.calculateEngagementScore(user);
                    return engagementScore > 75;
                },
                action: 'trigger_sequence',
                sequence: 'premium_conversion',
                cooldown: 30 * 24 * 60 * 60 * 1000 // 30 days
            },
            inactive_user: {
                condition: (user) => {
                    const lastActivity = new Date(user.lastActivity || user.registrationDate);
                    const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
                    return daysSinceActivity > 30;
                },
                action: 'trigger_sequence',
                sequence: 'reengagement_sequence',
                cooldown: 60 * 24 * 60 * 60 * 1000 // 60 days
            },
            multiple_downloads: {
                condition: (user) => {
                    return user.downloads && user.downloads.length >= 2;
                },
                action: 'trigger_sequence',
                sequence: 'premium_conversion',
                cooldown: 14 * 24 * 60 * 60 * 1000 // 14 days
            }
        };
    }

    // Add user to email system
    addSubscriber(userData) {
        const subscriber = {
            id: userData.id || this.generateSubscriberId(),
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            membershipTier: userData.membershipTier || 'free',
            subscriptionDate: new Date().toISOString(),
            status: 'active',
            preferences: {
                newsletter: userData.newsletter !== false,
                promotions: userData.marketingEmails || false,
                notifications: userData.notifications !== false
            },
            engagement: {
                score: 0,
                emailsOpened: 0,
                emailsClicked: 0,
                lastActivity: new Date().toISOString()
            },
            downloads: [],
            sequences: {},
            tags: []
        };

        this.subscribers.push(subscriber);
        this.saveSubscribers();

        // Trigger welcome sequence
        this.triggerSequence(subscriber.id, 'welcome_sequence');

        return subscriber;
    }

    // Trigger email sequence
    triggerSequence(subscriberId, sequenceName) {
        const subscriber = this.subscribers.find(s => s.id === subscriberId);
        const sequence = this.emailSequences[sequenceName];

        if (!subscriber || !sequence) return;

        // Check if sequence already triggered recently
        const lastTriggered = subscriber.sequences[sequenceName];
        if (lastTriggered) {
            const timeSince = Date.now() - new Date(lastTriggered).getTime();
            const cooldown = sequence.cooldown || 30 * 24 * 60 * 60 * 1000; // 30 days default
            if (timeSince < cooldown) return;
        }

        // Mark sequence as triggered
        subscriber.sequences[sequenceName] = new Date().toISOString();
        this.saveSubscribers();

        // Schedule emails in sequence
        sequence.emails.forEach(email => {
            this.scheduleEmail({
                subscriberId: subscriber.id,
                template: email.template,
                scheduledFor: new Date(Date.now() + email.delay).toISOString(),
                sequenceName: sequenceName
            });
        });
    }

    // Schedule email
    scheduleEmail(emailData) {
        const email = {
            id: this.generateEmailId(),
            subscriberId: emailData.subscriberId,
            template: emailData.template,
            scheduledFor: emailData.scheduledFor,
            status: 'scheduled',
            sequenceName: emailData.sequenceName,
            createdAt: new Date().toISOString()
        };

        this.emailQueue.push(email);
        this.saveEmailQueue();
    }

    // Process email queue
    processEmailQueue() {
        const now = new Date();
        const readyEmails = this.emailQueue.filter(email => 
            email.status === 'scheduled' && 
            new Date(email.scheduledFor) <= now
        );

        readyEmails.forEach(email => {
            this.sendEmail(email);
        });
    }

    // Send email (simulate)
    sendEmail(email) {
        const subscriber = this.subscribers.find(s => s.id === email.subscriberId);
        const template = this.emailTemplates[email.template];

        if (!subscriber || !template) {
            email.status = 'failed';
            email.failureReason = 'Subscriber or template not found';
            this.saveEmailQueue();
            return;
        }

        // Personalize email content
        const personalizedContent = this.personalizeEmail(template, subscriber);

        // Simulate sending (in production, integrate with email service)
        console.log(`📧 Sending email to ${subscriber.email}:`, {
            subject: personalizedContent.subject,
            template: email.template,
            sequence: email.sequenceName
        });

        // Update email status
        email.status = 'sent';
        email.sentAt = new Date().toISOString();

        // Track subscriber engagement
        this.trackEmailSent(subscriber.id, email.template);

        this.saveEmailQueue();
    }

    // Personalize email content
    personalizeEmail(template, subscriber) {
        let subject = template.subject;
        let content = template.template;

        // Replace placeholders
        const placeholders = {
            '{{firstName}}': subscriber.firstName,
            '{{lastName}}': subscriber.lastName,
            '{{membershipTier}}': subscriber.membershipTier,
            '{{downloadLink}}': this.getDownloadLink('email_toolkit'),
            '{{contentStrategyGuideUrl}}': '/resources/content-strategy-guide',
            '{{caseStudyUrl}}': '/case-studies/sarah-success',
            '{{upgradeUrl}}': '/upgrade?discount=50OFF',
            '{{reengageUrl}}': '/recent-content',
            '{{blogUrl}}': '/blog',
            '{{toolsUrl}}': '/tools',
            '{{communityUrl}}': '/community',
            '{{unsubscribeUrl}}': `/unsubscribe?id=${subscriber.id}`
        };

        Object.keys(placeholders).forEach(placeholder => {
            const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
            subject = subject.replace(regex, placeholders[placeholder]);
            content = content.replace(regex, placeholders[placeholder]);
        });

        return { subject, content };
    }

    // Track email engagement
    trackEmailSent(subscriberId, template) {
        const subscriber = this.subscribers.find(s => s.id === subscriberId);
        if (subscriber) {
            subscriber.engagement.lastActivity = new Date().toISOString();
            this.saveSubscribers();
        }
    }

    trackEmailOpened(subscriberId, emailId) {
        const subscriber = this.subscribers.find(s => s.id === subscriberId);
        if (subscriber) {
            subscriber.engagement.emailsOpened += 1;
            subscriber.engagement.score += 5;
            subscriber.engagement.lastActivity = new Date().toISOString();
            this.saveSubscribers();
        }
    }

    trackEmailClicked(subscriberId, emailId) {
        const subscriber = this.subscribers.find(s => s.id === subscriberId);
        if (subscriber) {
            subscriber.engagement.emailsClicked += 1;
            subscriber.engagement.score += 10;
            subscriber.engagement.lastActivity = new Date().toISOString();
            this.saveSubscribers();
        }
    }

    // Calculate engagement score
    calculateEngagementScore(subscriber) {
        const engagement = subscriber.engagement || {};
        const baseScore = engagement.score || 0;
        
        // Bonus for recent activity
        const lastActivity = new Date(engagement.lastActivity || subscriber.subscriptionDate);
        const daysSinceActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
        const recencyBonus = Math.max(0, 20 - daysSinceActivity);
        
        // Bonus for membership tier
        const tierBonus = subscriber.membershipTier === 'premium' ? 25 : 
                         subscriber.membershipTier === 'pro' ? 50 : 0;

        return Math.min(100, baseScore + recencyBonus + tierBonus);
    }

    // Check automation triggers
    checkAutomationTriggers() {
        this.subscribers.forEach(subscriber => {
            Object.keys(this.automationRules).forEach(ruleKey => {
                const rule = this.automationRules[ruleKey];
                
                if (rule.condition(subscriber)) {
                    // Check cooldown
                    const lastTriggered = subscriber.automationHistory?.[ruleKey];
                    if (lastTriggered) {
                        const timeSince = Date.now() - new Date(lastTriggered).getTime();
                        if (timeSince < rule.cooldown) return;
                    }

                    // Execute action
                    if (rule.action === 'trigger_sequence') {
                        this.triggerSequence(subscriber.id, rule.sequence);
                        
                        // Record trigger
                        if (!subscriber.automationHistory) {
                            subscriber.automationHistory = {};
                        }
                        subscriber.automationHistory[ruleKey] = new Date().toISOString();
                        this.saveSubscribers();
                    }
                }
            });
        });
    }

    // Track resource downloads
    trackDownload(subscriberId, resource) {
        const subscriber = this.subscribers.find(s => s.id === subscriberId);
        if (subscriber) {
            if (!subscriber.downloads) subscriber.downloads = [];
            
            subscriber.downloads.push({
                resource: resource,
                downloadedAt: new Date().toISOString()
            });
            
            subscriber.engagement.score += 15;
            subscriber.engagement.lastActivity = new Date().toISOString();
            
            this.saveSubscribers();

            // Check for multiple downloads trigger
            if (subscriber.downloads.length >= 2) {
                this.checkAutomationTriggers();
            }
        }
    }

    // Utility functions
    generateSubscriberId() {
        return 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateEmailId() {
        return 'email_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getDownloadLink(resource) {
        return `/download/${resource}?tracking=email`;
    }

    // Storage functions
    saveSubscribers() {
        localStorage.setItem('email_subscribers', JSON.stringify(this.subscribers));
    }

    saveEmailQueue() {
        localStorage.setItem('email_queue', JSON.stringify(this.emailQueue));
    }

    // Admin functions
    getSubscriberStats() {
        const totalSubscribers = this.subscribers.length;
        const activeSubscribers = this.subscribers.filter(s => s.status === 'active').length;
        const premiumSubscribers = this.subscribers.filter(s => s.membershipTier !== 'free').length;
        
        const averageEngagement = this.subscribers.reduce((sum, s) => 
            sum + this.calculateEngagementScore(s), 0) / totalSubscribers;

        return {
            totalSubscribers,
            activeSubscribers,
            premiumSubscribers,
            averageEngagement: Math.round(averageEngagement),
            conversionRate: (premiumSubscribers / totalSubscribers * 100).toFixed(1)
        };
    }

    getEmailStats() {
        const totalEmails = this.emailQueue.length;
        const sentEmails = this.emailQueue.filter(e => e.status === 'sent').length;
        const scheduledEmails = this.emailQueue.filter(e => e.status === 'scheduled').length;
        
        return {
            totalEmails,
            sentEmails,
            scheduledEmails,
            deliveryRate: (sentEmails / totalEmails * 100).toFixed(1)
        };
    }
}

// Initialize email automation system
const emailAutomation = new EmailAutomationSystem();

// Integration with auth system
if (typeof window !== 'undefined' && window.blogAuth) {
    // Hook into registration to add subscribers
    const originalRegister = window.blogAuth.register.bind(window.blogAuth);
    window.blogAuth.register = async function(userData) {
        const result = await originalRegister(userData);
        if (result.success) {
            emailAutomation.addSubscriber(result.user);
        }
        return result;
    };
}

// Global functions for tracking
window.trackEmailOpen = function(subscriberId, emailId) {
    emailAutomation.trackEmailOpened(subscriberId, emailId);
};

window.trackEmailClick = function(subscriberId, emailId) {
    emailAutomation.trackEmailClicked(subscriberId, emailId);
};

window.trackDownload = function(subscriberId, resource) {
    emailAutomation.trackDownload(subscriberId, resource);
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EmailAutomationSystem };
}
