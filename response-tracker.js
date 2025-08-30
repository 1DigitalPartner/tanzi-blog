/**
 * Campaign Response Tracker
 * Simple system to track and manage responses to cold email campaigns
 */

const fs = require('fs').promises;
const path = require('path');

class ResponseTracker {
    constructor() {
        this.responsesFile = path.join(__dirname, 'campaign-responses.json');
        this.leadsFile = path.join(__dirname, 'qualified-leads.json');
    }

    /**
     * Log a response from a prospect
     */
    async logResponse(responseData) {
        const response = {
            id: `response_${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...responseData
        };

        let responses = [];
        try {
            const data = await fs.readFile(this.responsesFile, 'utf8');
            responses = JSON.parse(data);
        } catch (error) {
            // File doesn't exist, start with empty array
        }

        responses.push(response);
        await fs.writeFile(this.responsesFile, JSON.stringify(responses, null, 2));

        console.log('✅ Response logged:', response.email, '-', response.responseType);
        
        // If they're interested, create a qualified lead
        if (response.responseType === 'interested' || response.triggerWord) {
            await this.createQualifiedLead(response);
        }

        return response;
    }

    /**
     * Create a qualified lead from interested response
     */
    async createQualifiedLead(response) {
        const lead = {
            id: `lead_${Date.now()}`,
            email: response.email,
            name: response.name || response.email.split('@')[0],
            company: response.company || response.email.split('@')[1],
            source: 'cold_email',
            campaignId: response.campaignId,
            triggerWord: response.triggerWord,
            audienceSegment: response.audienceSegment,
            initialResponse: response.responseContent,
            status: 'new',
            created: new Date().toISOString(),
            nextAction: this.determineNextAction(response)
        };

        let leads = [];
        try {
            const data = await fs.readFile(this.leadsFile, 'utf8');
            leads = JSON.parse(data);
        } catch (error) {
            // File doesn't exist, start with empty array
        }

        leads.push(lead);
        await fs.writeFile(this.leadsFile, JSON.stringify(leads, null, 2));

        console.log('🎯 Qualified lead created:', lead.email);
        return lead;
    }

    /**
     * Determine next action based on response
     */
    determineNextAction(response) {
        const actionMap = {
            'DATA': 'Send Data Science Intelligence Report',
            'INSIGHTS': 'Send Marketing Intelligence Report', 
            'STRATEGY': 'Send Business Intelligence Report',
            'FOUNDER': 'Send Founder Playbook',
            'AGENCY': 'Send Agency Methodology',
            'TECH': 'Send Tech Career Strategy',
            'CALL': 'Schedule strategy call',
            'PLAYBOOK': 'Send AI Implementation Playbook'
        };

        return actionMap[response.triggerWord] || 'Send appropriate lead magnet';
    }

    /**
     * Get campaign performance summary
     */
    async getCampaignPerformance() {
        try {
            const responses = JSON.parse(await fs.readFile(this.responsesFile, 'utf8'));
            const leads = JSON.parse(await fs.readFile(this.leadsFile, 'utf8'));

            const stats = {
                totalResponses: responses.length,
                qualifiedLeads: leads.length,
                responsesByType: {},
                responsesBySegment: {},
                leadsByTrigger: {}
            };

            // Count responses by type
            responses.forEach(r => {
                stats.responsesByType[r.responseType] = (stats.responsesByType[r.responseType] || 0) + 1;
                if (r.audienceSegment) {
                    stats.responsesBySegment[r.audienceSegment] = (stats.responsesBySegment[r.audienceSegment] || 0) + 1;
                }
            });

            // Count leads by trigger word
            leads.forEach(l => {
                if (l.triggerWord) {
                    stats.leadsByTrigger[l.triggerWord] = (stats.leadsByTrigger[l.triggerWord] || 0) + 1;
                }
            });

            return stats;
        } catch (error) {
            return {
                totalResponses: 0,
                qualifiedLeads: 0,
                responsesByType: {},
                responsesBySegment: {},
                leadsByTrigger: {}
            };
        }
    }

    /**
     * Get leads that need follow-up
     */
    async getLeadsNeedingFollowup() {
        try {
            const leads = JSON.parse(await fs.readFile(this.leadsFile, 'utf8'));
            return leads.filter(lead => lead.status === 'new' || lead.status === 'responded');
        } catch (error) {
            return [];
        }
    }

    /**
     * Update lead status
     */
    async updateLeadStatus(leadId, newStatus, notes = '') {
        try {
            const leads = JSON.parse(await fs.readFile(this.leadsFile, 'utf8'));
            const leadIndex = leads.findIndex(l => l.id === leadId);
            
            if (leadIndex !== -1) {
                leads[leadIndex].status = newStatus;
                leads[leadIndex].lastUpdated = new Date().toISOString();
                if (notes) leads[leadIndex].notes = notes;
                
                await fs.writeFile(this.leadsFile, JSON.stringify(leads, null, 2));
                console.log(`✅ Lead ${leadId} updated to status: ${newStatus}`);
                return leads[leadIndex];
            }
        } catch (error) {
            console.error('Error updating lead:', error);
        }
        return null;
    }

    /**
     * Display response dashboard
     */
    async showDashboard() {
        console.log('\n📊 COLD EMAIL CAMPAIGN RESPONSE DASHBOARD\n');
        console.log('═══════════════════════════════════════════\n');

        const stats = await getCampaignPerformance();
        const pendingLeads = await this.getLeadsNeedingFollowup();

        console.log('📈 Overall Performance:');
        console.log(`   📧 Total Responses: ${stats.totalResponses}`);
        console.log(`   🎯 Qualified Leads: ${stats.qualifiedLeads}`);
        console.log(`   ⏳ Pending Follow-ups: ${pendingLeads.length}\n`);

        if (Object.keys(stats.responsesByType).length > 0) {
            console.log('📊 Responses by Type:');
            Object.entries(stats.responsesByType).forEach(([type, count]) => {
                console.log(`   ${type}: ${count}`);
            });
            console.log();
        }

        if (Object.keys(stats.responsesBySegment).length > 0) {
            console.log('🎯 Responses by Audience Segment:');
            Object.entries(stats.responsesBySegment).forEach(([segment, count]) => {
                console.log(`   ${segment.replace(/_/g, ' ')}: ${count}`);
            });
            console.log();
        }

        if (Object.keys(stats.leadsByTrigger).length > 0) {
            console.log('🔥 Most Popular Lead Magnets:');
            Object.entries(stats.leadsByTrigger)
                .sort(([,a], [,b]) => b - a)
                .forEach(([trigger, count]) => {
                    console.log(`   ${trigger}: ${count} requests`);
                });
            console.log();
        }

        if (pendingLeads.length > 0) {
            console.log('⚡ Leads Needing Follow-up:');
            pendingLeads.slice(0, 5).forEach(lead => {
                console.log(`   📧 ${lead.email} - ${lead.nextAction} (${lead.triggerWord || 'general'})`);
            });
            if (pendingLeads.length > 5) {
                console.log(`   ... and ${pendingLeads.length - 5} more`);
            }
        }
    }
}

module.exports = ResponseTracker;

// CLI usage
if (require.main === module) {
    const tracker = new ResponseTracker();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'log':
            // Example: node response-tracker.js log
            const sampleResponse = {
                email: 'john.doe@example.com',
                name: 'John Doe',
                company: 'Example Corp',
                campaignId: 'campaign_123',
                audienceSegment: 'marketing_executives',
                responseType: 'interested',
                triggerWord: 'INSIGHTS',
                responseContent: 'This looks really interesting! I\'d love to see the complete analysis.'
            };
            
            tracker.logResponse(sampleResponse).then(() => {
                console.log('Sample response logged successfully!');
                console.log('\nTo log real responses, use:');
                console.log('const tracker = new ResponseTracker();');
                console.log('await tracker.logResponse({...responseData});');
            });
            break;
            
        case 'dashboard':
            tracker.showDashboard();
            break;
            
        case 'leads':
            tracker.getLeadsNeedingFollowup().then(leads => {
                console.log(`\n📧 ${leads.length} Leads Needing Follow-up:\n`);
                leads.forEach(lead => {
                    console.log(`${lead.email}`);
                    console.log(`   Company: ${lead.company}`);
                    console.log(`   Trigger: ${lead.triggerWord || 'general'}`);
                    console.log(`   Action: ${lead.nextAction}`);
                    console.log(`   Created: ${new Date(lead.created).toLocaleDateString()}\n`);
                });
            });
            break;
            
        default:
            console.log(`
📊 Response Tracker Commands:

  log         Log a sample response (for testing)
  dashboard   Show response performance dashboard  
  leads       Show leads needing follow-up

Examples:
  node response-tracker.js dashboard
  node response-tracker.js leads

Manual Response Logging:
  const tracker = new ResponseTracker();
  await tracker.logResponse({
    email: 'prospect@company.com',
    name: 'John Smith', 
    company: 'Tech Corp',
    campaignId: 'campaign_123',
    audienceSegment: 'data_science_professionals',
    responseType: 'interested',
    triggerWord: 'DATA',
    responseContent: 'I would love to see this report!'
  });
            `);
    }
}

// Export function for dashboard access
async function getCampaignPerformance() {
    const tracker = new ResponseTracker();
    return await tracker.getCampaignPerformance();
}

module.exports.getCampaignPerformance = getCampaignPerformance;
