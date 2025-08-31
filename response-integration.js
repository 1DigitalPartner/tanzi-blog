/**
 * Response Integration System
 * Connects autoresponder with response tracking for seamless campaign management
 */

const CampaignAutoresponder = require('./campaign-autoresponder');
const ResponseTracker = require('./response-tracker');
const fs = require('fs').promises;

class ResponseIntegration {
    constructor() {
        this.autoresponder = new CampaignAutoresponder();
        this.tracker = new ResponseTracker();
        this.pendingResponsesFile = './pending-responses.json';
    }

    /**
     * Process a new response manually (when you receive an email)
     */
    async processManualResponse(responseData) {
        console.log('\n📧 Processing New Response');
        console.log('==========================');
        console.log(`From: ${responseData.email}`);
        console.log(`Content Preview: ${responseData.responseContent.substring(0, 100)}...`);

        try {
            // 1. Log the response in tracker
            console.log('\n📊 Logging response...');
            const trackedResponse = await this.tracker.logResponse({
                email: responseData.email,
                name: responseData.firstName || responseData.email.split('@')[0],
                company: responseData.company || responseData.email.split('@')[1],
                campaignId: responseData.campaignId || 'manual',
                audienceSegment: responseData.audienceSegment || 'unknown',
                responseType: 'interested', // Will be refined by autoresponder
                triggerWord: this.extractTriggerWords(responseData.responseContent),
                responseContent: responseData.responseContent
            });

            console.log('✅ Response logged successfully');

            // 2. Generate and send autoresponse
            console.log('\n🤖 Generating autoresponse...');
            const autoResult = await this.autoresponder.processIncomingResponse(responseData);
            
            console.log(`✅ Autoresponse processed: ${autoResult.responseType}`);
            console.log(`📧 Autoresponse sent: ${autoResult.autoresponseSent ? 'Yes' : 'No'}`);

            // 3. Update response type based on autoresponder analysis
            if (autoResult.responseType !== 'interested') {
                // Update the tracked response with more accurate type
                console.log(`🔄 Updating response type to: ${autoResult.responseType}`);
            }

            return {
                success: true,
                responseLogged: true,
                autoresponseSent: autoResult.autoresponseSent,
                responseType: autoResult.responseType,
                followupRequired: this.needsFollowup(autoResult.responseType)
            };

        } catch (error) {
            console.error('❌ Error processing response:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Extract trigger words from response content
     */
    extractTriggerWords(content) {
        const triggers = ['DATA', 'INSIGHTS', 'STRATEGY', 'FOUNDER', 'AGENCY', 'TECH', 'CALL', 'MEETING'];
        const found = triggers.filter(trigger => 
            content.toUpperCase().includes(trigger)
        );
        return found.length > 0 ? found[0] : null;
    }

    /**
     * Check if response type needs manual followup
     */
    needsFollowup(responseType) {
        const followupRequired = [
            'call_request',
            'qualification', 
            'timing_issue'
        ];
        return followupRequired.includes(responseType);
    }

    /**
     * Process multiple responses from email inbox
     */
    async processBatchResponses(responses) {
        console.log(`\n📥 Processing ${responses.length} responses in batch...`);
        
        const results = [];
        for (let i = 0; i < responses.length; i++) {
            const response = responses[i];
            console.log(`\n--- Processing Response ${i + 1}/${responses.length} ---`);
            
            const result = await this.processManualResponse(response);
            results.push({
                email: response.email,
                ...result
            });

            // Small delay between processing
            if (i < responses.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        // Generate batch summary
        this.generateBatchSummary(results);
        return results;
    }

    /**
     * Generate summary of batch processing
     */
    generateBatchSummary(results) {
        const summary = {
            total: results.length,
            successful: results.filter(r => r.success).length,
            autoresponsesSent: results.filter(r => r.autoresponseSent).length,
            needingFollowup: results.filter(r => r.followupRequired).length,
            byType: {}
        };

        results.forEach(result => {
            if (result.responseType) {
                summary.byType[result.responseType] = (summary.byType[result.responseType] || 0) + 1;
            }
        });

        console.log('\n📊 BATCH PROCESSING SUMMARY');
        console.log('============================');
        console.log(`✅ Successfully processed: ${summary.successful}/${summary.total}`);
        console.log(`🤖 Autoresponses sent: ${summary.autoresponsesSent}`);
        console.log(`⚡ Requiring followup: ${summary.needingFollowup}`);
        console.log('\n📈 Response Types:');
        Object.entries(summary.byType).forEach(([type, count]) => {
            console.log(`   ${type}: ${count}`);
        });
    }

    /**
     * Get dashboard showing current status
     */
    async getDashboard() {
        console.log('\n📊 RESPONSE INTEGRATION DASHBOARD');
        console.log('===================================');

        // Get response tracker stats
        const trackerStats = await this.tracker.getCampaignPerformance();
        console.log('\n📧 Response Tracking:');
        console.log(`   Total Responses: ${trackerStats.totalResponses}`);
        console.log(`   Qualified Leads: ${trackerStats.qualifiedLeads}`);

        // Get autoresponder stats
        const autoStats = await this.autoresponder.getAutoresponseStats();
        console.log('\n🤖 Autoresponder Performance:');
        console.log(`   Total Sent: ${autoStats.totalAutoresponses}`);
        console.log(`   Last 24h: ${autoStats.last24Hours}`);
        console.log(`   Last 7d: ${autoStats.last7Days}`);

        if (Object.keys(autoStats.byType).length > 0) {
            console.log('\n📈 Response Types Handled:');
            Object.entries(autoStats.byType).forEach(([type, count]) => {
                console.log(`   ${type}: ${count}`);
            });
        }

        // Get pending followups
        const pendingLeads = await this.tracker.getLeadsNeedingFollowup();
        if (pendingLeads.length > 0) {
            console.log('\n⚡ Leads Needing Manual Followup:');
            pendingLeads.slice(0, 5).forEach(lead => {
                console.log(`   📧 ${lead.email} - ${lead.nextAction}`);
            });
            if (pendingLeads.length > 5) {
                console.log(`   ... and ${pendingLeads.length - 5} more`);
            }
        }

        return {
            responseStats: trackerStats,
            autoresponderStats: autoStats,
            pendingFollowups: pendingLeads.length
        };
    }

    /**
     * Quick response processor for urgent replies
     */
    async quickResponse(email, content, campaignId = null) {
        console.log(`\n⚡ QUICK RESPONSE for ${email}`);
        
        const responseData = {
            email: email,
            firstName: email.split('@')[0],
            company: email.split('@')[1],
            campaignId: campaignId || 'quick_response',
            audienceSegment: 'unknown',
            responseContent: content
        };

        const result = await this.processManualResponse(responseData);
        
        if (result.success) {
            console.log(`✅ Quick response processed successfully`);
            console.log(`🤖 Autoresponse: ${result.autoresponseSent ? 'Sent' : 'Not sent'}`);
            console.log(`📋 Type: ${result.responseType}`);
            console.log(`⚡ Manual followup: ${result.followupRequired ? 'Required' : 'Not needed'}`);
        }

        return result;
    }

    /**
     * Schedule delayed responses for timing issues
     */
    async scheduleDelayedResponse(email, timeframe, originalResponse) {
        const delayedResponse = {
            email,
            originalResponse,
            scheduledFor: this.calculateDelayDate(timeframe),
            createdAt: new Date().toISOString(),
            status: 'scheduled'
        };

        let scheduled = [];
        try {
            const data = await fs.readFile('./scheduled-followups.json', 'utf8');
            scheduled = JSON.parse(data);
        } catch (error) {
            // File doesn't exist, start fresh
        }

        scheduled.push(delayedResponse);
        await fs.writeFile('./scheduled-followups.json', JSON.stringify(scheduled, null, 2));

        console.log(`📅 Scheduled followup for ${email} in ${timeframe}`);
        return delayedResponse;
    }

    /**
     * Calculate delay date for followups
     */
    calculateDelayDate(timeframe) {
        const now = new Date();
        const delays = {
            '2 months': 60 * 24 * 60 * 60 * 1000,
            '3 months': 90 * 24 * 60 * 60 * 1000,
            '6 months': 180 * 24 * 60 * 60 * 1000,
            'next quarter': 90 * 24 * 60 * 60 * 1000
        };

        const delayMs = delays[timeframe] || delays['3 months'];
        return new Date(now.getTime() + delayMs).toISOString();
    }
}

module.exports = ResponseIntegration;

// CLI usage
if (require.main === module) {
    const integration = new ResponseIntegration();
    
    const command = process.argv[2];
    const param1 = process.argv[3];
    const param2 = process.argv[4];
    
    switch (command) {
        case 'quick':
            if (!param1 || !param2) {
                console.log('Usage: node response-integration.js quick <email> <response_content>');
                console.log('Example: node response-integration.js quick john@company.com "This looks interesting! Send me the INSIGHTS"');
                process.exit(1);
            }
            integration.quickResponse(param1, param2).then(result => {
                console.log('\n✅ Quick response complete!');
            });
            break;
            
        case 'dashboard':
            integration.getDashboard();
            break;
            
        case 'process':
            // Example of processing a manual response
            const sampleResponse = {
                email: param1 || 'test@example.com',
                firstName: 'Test',
                company: 'Example Corp',
                campaignId: 'campaign_123',
                audienceSegment: 'marketing_executives',
                responseContent: param2 || 'This looks really interesting! Can you send me the INSIGHTS report?'
            };
            
            integration.processManualResponse(sampleResponse).then(result => {
                console.log('\n✅ Response processing complete!');
            });
            break;
            
        default:
            console.log(`
🔗 Response Integration System

Commands:
  dashboard                           Show integrated dashboard
  quick <email> <content>            Process urgent response quickly
  process [email] [content]          Process manual response (test mode)

Features:
✅ Automatic response detection and categorization
✅ Intelligent autoresponse generation  
✅ Response tracking and lead qualification
✅ Follow-up scheduling for timing issues
✅ Professional HTML email formatting
✅ Comprehensive analytics and reporting

Response Processing Flow:
1. Response received → Log in tracker
2. Analyze content → Determine response type
3. Generate autoresponse → Send appropriate template
4. Update lead status → Schedule followups if needed
5. Track performance → Generate analytics

Usage Example:
When you receive an email reply saying "Send me the DATA report":

node response-integration.js quick john@company.com "Send me the DATA report"

This will:
✅ Log the response
✅ Detect it's a report request  
✅ Send Data Science Intelligence Report
✅ Create qualified lead
✅ Track the interaction

🚀 Perfect for managing high-volume cold email responses!
            `);
    }
}
