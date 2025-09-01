/**
 * Lead Qualification and Scoring System
 * Implements BANT+ qualification framework from advanced lead generation strategies
 */

const fs = require('fs').promises;
const path = require('path');

class LeadQualificationSystem {
    constructor() {
        this.leadDatabase = path.join(__dirname, 'leads-database.json');
        this.qualificationLog = path.join(__dirname, 'lead-qualification-log.json');
        this.scoringRules = this.initializeScoringRules();
        this.qualificationCriteria = this.initializeQualificationCriteria();
        this.servicePackages = this.initializeServicePackages();
    }

    /**
     * Initialize BANT+ scoring rules
     */
    initializeScoringRules() {
        return {
            // Budget scoring (0-25 points)
            budget: {
                'enterprise': 25,      // $25K+ monthly budget
                'growth': 20,          // $8K-25K monthly budget  
                'starter': 15,         // $2K-8K monthly budget
                'small': 10,           // $500-2K monthly budget
                'unknown': 0           // No budget information
            },
            
            // Authority scoring (0-20 points)
            authority: {
                'decision_maker': 20,  // CEO, CMO, Owner
                'strong_influence': 15, // VP, Director, Manager
                'moderate_influence': 10, // Senior individual contributor
                'weak_influence': 5,   // Individual contributor
                'unknown': 0           // No authority information
            },
            
            // Need scoring (0-25 points)
            need: {
                'urgent': 25,          // Immediate pain point
                'strong': 20,          // Clear business need
                'moderate': 15,        // Some interest/need
                'weak': 10,            // Exploring options
                'unknown': 0           // No clear need
            },
            
            // Timeline scoring (0-15 points)
            timeline: {
                'immediate': 15,       // Ready to start within 30 days
                'short_term': 12,      // 30-60 days
                'medium_term': 8,      // 3-6 months
                'long_term': 4,        // 6+ months
                'unknown': 0           // No timeline specified
            },
            
            // Trust/Engagement scoring (0-15 points)
            trust: {
                'high_engagement': 15, // Multiple interactions, shared content
                'moderate_engagement': 10, // Some engagement
                'low_engagement': 5,   // Minimal interaction
                'no_engagement': 0     // First-time interaction
            }
        };
    }

    /**
     * Initialize qualification criteria based on lead generation strategies
     */
    initializeQualificationCriteria() {
        return {
            // Minimum qualification thresholds
            minimumScore: {
                'enterprise': 70,    // Enterprise package qualification
                'growth': 50,        // Growth package qualification  
                'starter': 30        // Starter package qualification
            },
            
            // BANT+ framework criteria
            requirements: {
                budget: {
                    enterprise: '$25,000+ monthly marketing budget',
                    growth: '$8,000+ monthly marketing budget',
                    starter: '$2,000+ monthly marketing budget'
                },
                authority: {
                    enterprise: 'C-level or VP with decision authority',
                    growth: 'Director/Manager with budget authority',
                    starter: 'Decision maker or strong influence'
                },
                need: {
                    enterprise: 'Strategic social media intelligence priority',
                    growth: 'Performance improvement needed',
                    starter: 'Social media challenges documented'
                },
                timeline: {
                    enterprise: 'Ready to start within 30-60 days',
                    growth: 'Ready to start within 60 days', 
                    starter: 'Ready to start within 90 days'
                },
                trust: {
                    all: 'Engaged with content consistently'
                }
            }
        };
    }

    /**
     * Initialize service packages from lead generation strategies
     */
    initializeServicePackages() {
        return {
            starter: {
                name: 'Intelligence Audit',
                price: '$2,997',
                duration: '2 weeks',
                target: 'Small businesses, solopreneurs',
                deliverables: [
                    'Complete social media audit',
                    'Competitive analysis (top 5 competitors)',
                    'Content template library',
                    '90-day action plan',
                    '1-hour strategy session'
                ],
                profitMargin: '85%',
                workHours: '10 hours'
            },
            growth: {
                name: 'Social Intelligence System',
                price: '$8,997/month',
                duration: '6-12 month contracts',
                target: 'Mid-market businesses',
                deliverables: [
                    'Monthly competitive intelligence reports',
                    'Content strategy and calendar',
                    'Performance optimization',
                    'Team training and support',
                    'Quarterly strategy reviews'
                ],
                profitMargin: '75%',
                workHours: '25 hours/month'
            },
            enterprise: {
                name: 'Market Dominance Program',
                price: '$25,000-75,000/month',
                duration: '12-24 month contracts',
                target: 'Large enterprises, agencies',
                deliverables: [
                    'Advanced competitive intelligence',
                    'Multi-market analysis and expansion',
                    'Executive reporting and presentations',
                    'Team development programs',
                    'Strategic partnership facilitation'
                ],
                profitMargin: '70%',
                workHours: '60-100 hours/month'
            }
        };
    }

    /**
     * Process and score new leads
     */
    async processNewLeads() {
        try {
            const leads = await this.getUnprocessedLeads();
            
            for (const lead of leads) {
                const qualification = await this.qualifyLead(lead);
                await this.updateLeadWithQualification(lead.id, qualification);
                await this.logQualification(lead, qualification);
                
                console.log(`📊 Qualified lead: ${lead.author} - Score: ${qualification.totalScore} (${qualification.tier})`);
            }
            
            console.log(`✅ Processed ${leads.length} leads for qualification`);
        } catch (error) {
            console.error('❌ Error processing leads for qualification:', error);
        }
    }

    /**
     * Get leads that haven't been qualified yet
     */
    async getUnprocessedLeads() {
        try {
            const leadsData = await fs.readFile(this.leadDatabase, 'utf8');
            const leads = JSON.parse(leadsData);
            
            return leads.filter(lead => 
                !lead.qualified && 
                lead.status === 'new'
            );
        } catch (error) {
            console.log('No leads database found');
            return [];
        }
    }

    /**
     * Qualify individual lead using BANT+ framework
     */
    async qualifyLead(lead) {
        const scores = {
            budget: this.scoreBudget(lead),
            authority: this.scoreAuthority(lead),
            need: this.scoreNeed(lead),
            timeline: this.scoreTimeline(lead),
            trust: this.scoreTrust(lead)
        };
        
        const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
        const tier = this.determineTier(totalScore);
        const recommendedPackage = this.recommendPackage(tier, scores);
        const priorityLevel = this.calculatePriorityLevel(totalScore, scores);
        const nextActions = this.generateNextActions(tier, scores, lead);
        
        return {
            leadId: lead.id,
            leadName: lead.author,
            qualificationDate: new Date().toISOString(),
            scores: scores,
            totalScore: totalScore,
            maxScore: 100,
            tier: tier,
            recommendedPackage: recommendedPackage,
            priorityLevel: priorityLevel,
            nextActions: nextActions,
            qualificationNotes: this.generateQualificationNotes(lead, scores),
            estimatedValue: this.estimateLeadValue(tier, scores),
            followUpSchedule: this.generateFollowUpSchedule(tier, scores)
        };
    }

    /**
     * Score budget based on detected company size and industry
     */
    scoreBudget(lead) {
        const budgetIndicators = {
            // Company size indicators
            'enterprise': ['fortune', '500', 'corporation', 'inc.', 'corp', '1000+', 'employees'],
            'growth': ['company', 'business', '50-500', 'mid-size', 'scale'],
            'starter': ['startup', 'small', 'local', 'freelance', '10-50'],
            'small': ['solo', 'individual', 'personal', 'side project']
        };
        
        const leadText = `${lead.comment} ${lead.postTitle} ${lead.author}`.toLowerCase();
        
        for (const [budgetTier, indicators] of Object.entries(budgetIndicators)) {
            if (indicators.some(indicator => leadText.includes(indicator))) {
                return this.scoringRules.budget[budgetTier];
            }
        }
        
        // Default scoring based on trigger word value
        const highValueTriggers = ['PLAYBOOK', 'REPORT', 'ANALYSIS'];
        if (highValueTriggers.includes(lead.triggerWord)) {
            return this.scoringRules.budget.growth;
        }
        
        return this.scoringRules.budget.unknown;
    }

    /**
     * Score authority based on title and role indicators
     */
    scoreAuthority(lead) {
        const authorityIndicators = {
            'decision_maker': ['ceo', 'cmo', 'founder', 'owner', 'president', 'director', 'vp'],
            'strong_influence': ['manager', 'head', 'lead', 'senior', 'principal'],
            'moderate_influence': ['specialist', 'coordinator', 'analyst', 'consultant'],
            'weak_influence': ['assistant', 'intern', 'junior', 'trainee']
        };
        
        const authorText = lead.author.toLowerCase();
        const commentText = lead.comment.toLowerCase();
        
        for (const [authorityLevel, indicators] of Object.entries(authorityIndicators)) {
            if (indicators.some(indicator => 
                authorText.includes(indicator) || commentText.includes(indicator)
            )) {
                return this.scoringRules.authority[authorityLevel];
            }
        }
        
        // Score based on engagement quality
        if (lead.comment.length > 100) {
            return this.scoringRules.authority.moderate_influence;
        }
        
        return this.scoringRules.authority.unknown;
    }

    /**
     * Score need based on problem indicators in comment
     */
    scoreNeed(lead) {
        const needIndicators = {
            'urgent': [
                'struggling', 'failing', 'losing money', 'crisis', 'urgent', 'immediately',
                'not working', 'disaster', 'emergency', 'help!'
            ],
            'strong': [
                'need help', 'looking for', 'problem with', 'challenge', 'issue',
                'improve', 'optimize', 'better results', 'ROI'
            ],
            'moderate': [
                'interested', 'curious', 'exploring', 'considering', 'want to learn'
            ],
            'weak': [
                'thanks', 'good post', 'interesting', 'nice', 'cool'
            ]
        };
        
        const commentText = lead.comment.toLowerCase();
        
        for (const [needLevel, indicators] of Object.entries(needIndicators)) {
            if (indicators.some(indicator => commentText.includes(indicator))) {
                return this.scoringRules.need[needLevel];
            }
        }
        
        return this.scoringRules.need.unknown;
    }

    /**
     * Score timeline based on urgency indicators
     */
    scoreTimeline(lead) {
        const timelineIndicators = {
            'immediate': ['asap', 'now', 'urgent', 'immediately', 'right away', 'this week'],
            'short_term': ['soon', 'next month', 'within 30 days', 'quickly'],
            'medium_term': ['few months', '3-6 months', 'this quarter', 'planning'],
            'long_term': ['next year', 'future', 'eventually', 'someday']
        };
        
        const commentText = lead.comment.toLowerCase();
        
        for (const [timelineLevel, indicators] of Object.entries(timelineIndicators)) {
            if (indicators.some(indicator => commentText.includes(indicator))) {
                return this.scoringRules.timeline[timelineLevel];
            }
        }
        
        // Default based on trigger word urgency
        const urgentTriggers = ['PLAYBOOK', 'OUTREACH'];
        if (urgentTriggers.includes(lead.triggerWord)) {
            return this.scoringRules.timeline.short_term;
        }
        
        return this.scoringRules.timeline.unknown;
    }

    /**
     * Score trust/engagement based on interaction history
     */
    scoreTrust(lead) {
        const engagementFactors = {
            commentLength: lead.comment.length,
            specificQuestions: (lead.comment.match(/\?/g) || []).length,
            personalDetails: this.containsPersonalDetails(lead.comment),
            previousInteractions: lead.previousInteractions || 0
        };
        
        let trustScore = 0;
        
        // Score based on comment depth
        if (engagementFactors.commentLength > 200) trustScore += 5;
        else if (engagementFactors.commentLength > 100) trustScore += 3;
        else if (engagementFactors.commentLength > 50) trustScore += 1;
        
        // Score based on questions asked
        if (engagementFactors.specificQuestions > 1) trustScore += 4;
        else if (engagementFactors.specificQuestions > 0) trustScore += 2;
        
        // Score based on personal details shared
        if (engagementFactors.personalDetails) trustScore += 3;
        
        // Score based on previous interactions
        trustScore += Math.min(engagementFactors.previousInteractions * 2, 6);
        
        return Math.min(trustScore, 15); // Cap at maximum trust score
    }

    /**
     * Check if comment contains personal/business details
     */
    containsPersonalDetails(comment) {
        const personalIndicators = [
            'my company', 'we are', 'our business', 'i work', 'our team',
            'my role', 'our situation', 'we need', 'our challenge'
        ];
        
        const commentLower = comment.toLowerCase();
        return personalIndicators.some(indicator => commentLower.includes(indicator));
    }

    /**
     * Determine qualification tier based on total score
     */
    determineTier(totalScore) {
        if (totalScore >= this.qualificationCriteria.minimumScore.enterprise) {
            return 'enterprise';
        } else if (totalScore >= this.qualificationCriteria.minimumScore.growth) {
            return 'growth';
        } else if (totalScore >= this.qualificationCriteria.minimumScore.starter) {
            return 'starter';
        } else {
            return 'nurture';
        }
    }

    /**
     * Recommend appropriate service package
     */
    recommendPackage(tier, scores) {
        if (tier === 'nurture') {
            return {
                name: 'Email Nurture Sequence',
                approach: 'Continue nurturing until qualification improves',
                timeline: 'Re-evaluate in 30-60 days'
            };
        }
        
        const servicePackage = this.servicePackages[tier];
        return {
            ...servicePackage,
            fitReason: this.explainPackageFit(tier, scores)
        };
    }

    /**
     * Explain why package fits the lead
     */
    explainPackageFit(tier, scores) {
        const reasons = [];
        
        if (scores.budget >= 20) reasons.push('Strong budget capacity');
        if (scores.authority >= 15) reasons.push('Decision making authority');
        if (scores.need >= 20) reasons.push('Urgent business need');
        if (scores.timeline >= 12) reasons.push('Ready to move quickly');
        if (scores.trust >= 10) reasons.push('High engagement level');
        
        return reasons.length > 0 ? reasons.join(', ') : 'Basic qualification met';
    }

    /**
     * Calculate priority level for lead follow-up
     */
    calculatePriorityLevel(totalScore, scores) {
        // High priority: Enterprise tier or high urgency
        if (totalScore >= 70 || (scores.need >= 20 && scores.timeline >= 12)) {
            return {
                level: 'high',
                followUpWindow: '24 hours',
                assignTo: 'senior_consultant',
                approach: 'direct_call'
            };
        }
        
        // Medium priority: Growth tier
        if (totalScore >= 50) {
            return {
                level: 'medium',
                followUpWindow: '48 hours',
                assignTo: 'consultant',
                approach: 'email_then_call'
            };
        }
        
        // Low priority: Starter tier
        if (totalScore >= 30) {
            return {
                level: 'low',
                followUpWindow: '1 week',
                assignTo: 'junior_consultant',
                approach: 'email_sequence'
            };
        }
        
        // Nurture: Below qualification threshold
        return {
            level: 'nurture',
            followUpWindow: 'ongoing',
            assignTo: 'automated_system',
            approach: 'email_nurture'
        };
    }

    /**
     * Generate specific next actions based on qualification
     */
    generateNextActions(tier, scores, lead) {
        const actions = [];
        
        if (tier === 'enterprise') {
            actions.push({
                action: 'Schedule executive briefing call',
                timeline: 'Within 24 hours',
                owner: 'senior_consultant',
                notes: 'Prepare competitive analysis for their industry'
            });
            actions.push({
                action: 'Send customized proposal',
                timeline: '48 hours after call',
                owner: 'senior_consultant', 
                notes: 'Include ROI projections and case studies'
            });
        } else if (tier === 'growth') {
            actions.push({
                action: 'Send strategy call invitation',
                timeline: 'Within 48 hours',
                owner: 'consultant',
                notes: 'Include relevant case study in invitation'
            });
            actions.push({
                action: 'Prepare industry analysis',
                timeline: 'Before strategy call',
                owner: 'consultant',
                notes: 'Research their competitors and market position'
            });
        } else if (tier === 'starter') {
            actions.push({
                action: 'Send audit offer email',
                timeline: 'Within 1 week',
                owner: 'junior_consultant',
                notes: 'Emphasize quick wins and ROI'
            });
        } else {
            actions.push({
                action: 'Continue email nurture sequence',
                timeline: 'Ongoing',
                owner: 'automated_system',
                notes: 'Focus on education and trust building'
            });
        }
        
        return actions;
    }

    /**
     * Generate qualification notes
     */
    generateQualificationNotes(lead, scores) {
        const notes = [];
        
        // Budget assessment
        if (scores.budget >= 20) notes.push('Strong budget indicators');
        else if (scores.budget >= 15) notes.push('Moderate budget capacity');
        else notes.push('Budget unclear - needs verification');
        
        // Authority assessment  
        if (scores.authority >= 15) notes.push('Decision making authority confirmed');
        else if (scores.authority >= 10) notes.push('Some influence, may need buy-in');
        else notes.push('Authority level unclear');
        
        // Need assessment
        if (scores.need >= 20) notes.push('Strong business need expressed');
        else if (scores.need >= 15) notes.push('Clear interest in improvement');
        else notes.push('Need further qualification');
        
        // Trust indicators
        if (scores.trust >= 10) notes.push('High engagement and trust');
        else notes.push('Building relationship needed');
        
        return notes.join('. ');
    }

    /**
     * Estimate potential lead value
     */
    estimateLeadValue(tier, scores) {
        const baseValues = {
            enterprise: 450000,  // $450K (15 months * $30K average)
            growth: 108000,      // $108K (12 months * $9K)
            starter: 3000,       // $3K (one-time)
            nurture: 0
        };
        
        let estimatedValue = baseValues[tier] || 0;
        
        // Adjust based on urgency and authority
        if (scores.timeline >= 12 && scores.authority >= 15) {
            estimatedValue *= 1.2; // 20% premium for urgent + authority
        }
        
        // Adjust based on engagement
        if (scores.trust >= 12) {
            estimatedValue *= 1.1; // 10% premium for high trust
        }
        
        return {
            estimated: Math.round(estimatedValue),
            probability: this.calculateCloseProbability(tier, scores),
            timeline: this.estimateCloseTimeline(tier, scores)
        };
    }

    /**
     * Calculate probability of closing
     */
    calculateCloseProbability(tier, scores) {
        const baseProbability = {
            enterprise: 0.15,    // 15% close rate for enterprise
            growth: 0.25,        // 25% close rate for growth
            starter: 0.40,       // 40% close rate for starter
            nurture: 0.05        // 5% eventual conversion
        };
        
        let probability = baseProbability[tier] || 0;
        
        // Adjust based on total qualification strength
        const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
        if (totalScore >= 80) probability *= 1.5;
        else if (totalScore >= 60) probability *= 1.2;
        else if (totalScore <= 40) probability *= 0.7;
        
        return Math.min(probability, 0.75); // Cap at 75%
    }

    /**
     * Estimate timeline to close
     */
    estimateCloseTimeline(tier, scores) {
        const baseTimelines = {
            enterprise: '3-6 months',
            growth: '1-3 months', 
            starter: '2-4 weeks',
            nurture: '6+ months'
        };
        
        let timeline = baseTimelines[tier];
        
        // Accelerate for urgent needs
        if (scores.timeline >= 12 && scores.need >= 20) {
            if (tier === 'enterprise') timeline = '2-4 months';
            else if (tier === 'growth') timeline = '3-6 weeks';
            else if (tier === 'starter') timeline = '1-2 weeks';
        }
        
        return timeline;
    }

    /**
     * Generate follow-up schedule
     */
    generateFollowUpSchedule(tier, scores) {
        const schedules = {
            enterprise: [
                { day: 1, action: 'Send executive briefing invitation', type: 'email' },
                { day: 3, action: 'Follow up on briefing', type: 'call' },
                { day: 7, action: 'Send customized proposal', type: 'email' },
                { day: 14, action: 'Proposal follow-up call', type: 'call' },
                { day: 30, action: 'Decision timeline check', type: 'call' }
            ],
            growth: [
                { day: 2, action: 'Send strategy call invitation', type: 'email' },
                { day: 5, action: 'Follow up on invitation', type: 'email' },
                { day: 10, action: 'Alternative time slots', type: 'call' },
                { day: 21, action: 'Re-engagement campaign', type: 'email' }
            ],
            starter: [
                { day: 7, action: 'Send audit offer', type: 'email' },
                { day: 14, action: 'Follow up with case study', type: 'email' },
                { day: 28, action: 'Final offer with urgency', type: 'email' }
            ],
            nurture: [
                { day: 14, action: 'Educational content', type: 'email' },
                { day: 30, action: 'Re-qualification attempt', type: 'email' },
                { day: 60, action: 'Industry insights', type: 'email' },
                { day: 90, action: 'Check-in and re-score', type: 'email' }
            ]
        };
        
        return schedules[tier] || schedules.nurture;
    }

    /**
     * Update lead with qualification data
     */
    async updateLeadWithQualification(leadId, qualification) {
        try {
            const leadsData = await fs.readFile(this.leadDatabase, 'utf8');
            const leads = JSON.parse(leadsData);
            
            const leadIndex = leads.findIndex(lead => lead.id === leadId);
            if (leadIndex !== -1) {
                leads[leadIndex].qualified = true;
                leads[leadIndex].qualification = qualification;
                leads[leadIndex].qualificationDate = qualification.qualificationDate;
                leads[leadIndex].tier = qualification.tier;
                leads[leadIndex].priority = qualification.priorityLevel.level;
                leads[leadIndex].estimatedValue = qualification.estimatedValue.estimated;
                
                await fs.writeFile(this.leadDatabase, JSON.stringify(leads, null, 2));
            }
        } catch (error) {
            console.error('Error updating lead with qualification:', error);
        }
    }

    /**
     * Log qualification for tracking
     */
    async logQualification(lead, qualification) {
        try {
            let qualificationLogs = [];
            try {
                const logData = await fs.readFile(this.qualificationLog, 'utf8');
                qualificationLogs = JSON.parse(logData);
            } catch (error) {
                // File doesn't exist, start with empty array
            }

            qualificationLogs.push({
                ...qualification,
                originalLead: {
                    author: lead.author,
                    comment: lead.comment,
                    platform: lead.platform,
                    triggerWord: lead.triggerWord
                }
            });

            await fs.writeFile(this.qualificationLog, JSON.stringify(qualificationLogs, null, 2));
            
        } catch (error) {
            console.error('Error logging qualification:', error);
        }
    }

    /**
     * Generate qualification performance report
     */
    async generateQualificationReport() {
        try {
            const qualificationLogs = JSON.parse(await fs.readFile(this.qualificationLog, 'utf8'));
            
            const report = {
                generated: new Date().toISOString(),
                totalQualified: qualificationLogs.length,
                tierBreakdown: this.groupBy(qualificationLogs, 'tier'),
                averageScores: this.calculateAverageScores(qualificationLogs),
                priorityDistribution: this.analyzePriorityDistribution(qualificationLogs),
                estimatedPipelineValue: this.calculatePipelineValue(qualificationLogs),
                conversionProbabilities: this.calculateConversionProbabilities(qualificationLogs),
                actionItemsSummary: this.summarizeActionItems(qualificationLogs),
                performanceMetrics: this.calculatePerformanceMetrics(qualificationLogs)
            };

            await fs.writeFile(
                path.join(__dirname, 'lead-qualification-report.json'),
                JSON.stringify(report, null, 2)
            );

            console.log('📊 Lead qualification report generated');
            return report;
            
        } catch (error) {
            console.error('Error generating qualification report:', error);
        }
    }

    /**
     * Calculate average scores across all leads
     */
    calculateAverageScores(qualificationLogs) {
        const totals = { budget: 0, authority: 0, need: 0, timeline: 0, trust: 0, total: 0 };
        
        for (const log of qualificationLogs) {
            totals.budget += log.scores.budget;
            totals.authority += log.scores.authority;
            totals.need += log.scores.need;
            totals.timeline += log.scores.timeline;
            totals.trust += log.scores.trust;
            totals.total += log.totalScore;
        }
        
        const count = qualificationLogs.length;
        return {
            budget: Math.round(totals.budget / count),
            authority: Math.round(totals.authority / count), 
            need: Math.round(totals.need / count),
            timeline: Math.round(totals.timeline / count),
            trust: Math.round(totals.trust / count),
            total: Math.round(totals.total / count)
        };
    }

    /**
     * Analyze priority distribution
     */
    analyzePriorityDistribution(qualificationLogs) {
        const priorities = qualificationLogs.map(log => log.priorityLevel.level);
        return this.groupBy(priorities, null);
    }

    /**
     * Calculate total estimated pipeline value
     */
    calculatePipelineValue(qualificationLogs) {
        let totalValue = 0;
        let weightedValue = 0;
        
        for (const log of qualificationLogs) {
            const value = log.estimatedValue.estimated;
            const probability = log.estimatedValue.probability;
            
            totalValue += value;
            weightedValue += value * probability;
        }
        
        return {
            totalEstimatedValue: totalValue,
            weightedPipelineValue: Math.round(weightedValue),
            averageLeadValue: Math.round(totalValue / qualificationLogs.length)
        };
    }

    /**
     * Calculate conversion probabilities by tier
     */
    calculateConversionProbabilities(qualificationLogs) {
        const tierGroups = {};
        
        for (const log of qualificationLogs) {
            if (!tierGroups[log.tier]) {
                tierGroups[log.tier] = { count: 0, totalProbability: 0 };
            }
            tierGroups[log.tier].count++;
            tierGroups[log.tier].totalProbability += log.estimatedValue.probability;
        }
        
        const result = {};
        for (const [tier, data] of Object.entries(tierGroups)) {
            result[tier] = {
                averageProbability: (data.totalProbability / data.count * 100).toFixed(1) + '%',
                leadCount: data.count
            };
        }
        
        return result;
    }

    /**
     * Summarize action items across all qualified leads
     */
    summarizeActionItems(qualificationLogs) {
        const actionTypes = {};
        const urgentActions = [];
        
        for (const log of qualificationLogs) {
            for (const action of log.nextActions) {
                const actionType = action.action;
                actionTypes[actionType] = (actionTypes[actionType] || 0) + 1;
                
                if (action.timeline.includes('24 hours') || action.timeline.includes('urgent')) {
                    urgentActions.push({
                        lead: log.leadName,
                        action: action.action,
                        timeline: action.timeline
                    });
                }
            }
        }
        
        return {
            actionTypeBreakdown: actionTypes,
            urgentActions: urgentActions,
            totalPendingActions: qualificationLogs.reduce((sum, log) => sum + log.nextActions.length, 0)
        };
    }

    /**
     * Calculate performance metrics
     */
    calculatePerformanceMetrics(qualificationLogs) {
        const last30Days = qualificationLogs.filter(log => 
            Date.now() - new Date(log.qualificationDate).getTime() < 30 * 24 * 60 * 60 * 1000
        );
        
        return {
            qualificationRate: {
                last30Days: last30Days.length,
                dailyAverage: (last30Days.length / 30).toFixed(1)
            },
            qualityMetrics: {
                highPriorityLeads: qualificationLogs.filter(log => 
                    log.priorityLevel.level === 'high'
                ).length,
                enterpriseTierLeads: qualificationLogs.filter(log => 
                    log.tier === 'enterprise'
                ).length,
                averageScoreImprovement: this.calculateScoreImprovement(qualificationLogs)
            }
        };
    }

    /**
     * Calculate score improvement over time
     */
    calculateScoreImprovement(qualificationLogs) {
        if (qualificationLogs.length < 2) return '0%';
        
        const sorted = qualificationLogs.sort((a, b) => 
            new Date(a.qualificationDate) - new Date(b.qualificationDate)
        );
        
        const first10 = sorted.slice(0, 10);
        const last10 = sorted.slice(-10);
        
        const firstAvg = first10.reduce((sum, log) => sum + log.totalScore, 0) / first10.length;
        const lastAvg = last10.reduce((sum, log) => sum + log.totalScore, 0) / last10.length;
        
        const improvement = ((lastAvg - firstAvg) / firstAvg * 100).toFixed(1);
        return improvement + '%';
    }

    /**
     * Utility function to group array by property
     */
    groupBy(array, key) {
        if (!key) {
            // Group by value itself
            return array.reduce((result, item) => {
                result[item] = (result[item] || 0) + 1;
                return result;
            }, {});
        }
        
        return array.reduce((result, item) => {
            const group = item[key];
            result[group] = (result[group] || 0) + 1;
            return result;
        }, {});
    }

    /**
     * Get qualified leads for specific tier
     */
    async getQualifiedLeadsByTier(tier) {
        try {
            const leadsData = await fs.readFile(this.leadDatabase, 'utf8');
            const leads = JSON.parse(leadsData);
            
            return leads.filter(lead => 
                lead.qualified && 
                lead.tier === tier
            ).sort((a, b) => b.qualification.totalScore - a.qualification.totalScore);
        } catch (error) {
            console.error('Error getting qualified leads by tier:', error);
            return [];
        }
    }

    /**
     * Get high priority leads requiring immediate action
     */
    async getHighPriorityLeads() {
        try {
            const leadsData = await fs.readFile(this.leadDatabase, 'utf8');
            const leads = JSON.parse(leadsData);
            
            return leads.filter(lead => 
                lead.qualified && 
                lead.priority === 'high' &&
                !lead.contacted
            ).sort((a, b) => b.estimatedValue - a.estimatedValue);
        } catch (error) {
            console.error('Error getting high priority leads:', error);
            return [];
        }
    }
}

module.exports = LeadQualificationSystem;

// CLI usage
if (require.main === module) {
    const qualificationSystem = new LeadQualificationSystem();
    
    const command = process.argv[2];
    switch (command) {
        case 'process':
            qualificationSystem.processNewLeads();
            break;
        case 'report':
            qualificationSystem.generateQualificationReport().then(report => 
                console.log('Qualification Report:', JSON.stringify(report, null, 2))
            );
            break;
        case 'high-priority':
            qualificationSystem.getHighPriorityLeads().then(leads => 
                console.log('High Priority Leads:', JSON.stringify(leads, null, 2))
            );
            break;
        case 'tier':
            const tier = process.argv[3] || 'enterprise';
            qualificationSystem.getQualifiedLeadsByTier(tier).then(leads => 
                console.log(`${tier} Leads:`, JSON.stringify(leads, null, 2))
            );
            break;
        default:
            console.log(`
📊 Lead Qualification System Commands:

  process        Process and score new leads using BANT+
  report         Generate qualification performance report
  high-priority  Get leads requiring immediate attention
  tier [name]    Get qualified leads by tier (enterprise/growth/starter)

Examples:
  node lead-qualification-system.js process
  node lead-qualification-system.js report
  node lead-qualification-system.js high-priority
  node lead-qualification-system.js tier enterprise
            `);
    }
}
