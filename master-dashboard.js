#!/usr/bin/env node

// Master Campaign Dashboard - Complete Cold Email System Overview
// Unified view of campaigns, responses, autoresponder, and performance

const fs = require('fs');
const path = require('path');

// File paths
const CAMPAIGN_DIR = './data/campaigns';
const RESPONSE_FILE = './data/responses.json';
const AUTORESPONDER_LOG = './data/autoresponder-log.json';
const PROSPECTS_DIR = './data/prospects';

// Utility functions
function loadJSON(filepath, defaultValue = []) {
    try {
        if (fs.existsSync(filepath)) {
            return JSON.parse(fs.readFileSync(filepath, 'utf8'));
        }
    } catch (error) {
        console.log(`Warning: Could not load ${filepath}`);
    }
    return defaultValue;
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getRecentActivity(days = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return cutoff;
}

// Dashboard sections
function getCampaignOverview() {
    ensureDir(CAMPAIGN_DIR);
    const campaigns = [];
    
    try {
        const campaignFiles = fs.readdirSync(CAMPAIGN_DIR)
            .filter(file => file.endsWith('-campaign.json'));
        
        for (const file of campaignFiles) {
            const campaignData = loadJSON(path.join(CAMPAIGN_DIR, file));
            if (campaignData.length > 0) {
                campaigns.push(...campaignData);
            }
        }
    } catch (error) {
        // Directory doesn't exist yet
    }
    
    return campaigns;
}

function getResponseOverview() {
    const responses = loadJSON(RESPONSE_FILE);
    const autoresponderLog = loadJSON(AUTORESPONDER_LOG);
    
    return {
        responses,
        autoresponderLog
    };
}

function getProspectStats() {
    ensureDir(PROSPECTS_DIR);
    let totalProspects = 0;
    let prospectFiles = [];
    
    try {
        prospectFiles = fs.readdirSync(PROSPECTS_DIR)
            .filter(file => file.endsWith('.json'));
        
        for (const file of prospectFiles) {
            const prospects = loadJSON(path.join(PROSPECTS_DIR, file));
            totalProspects += prospects.length;
        }
    } catch (error) {
        // Directory doesn't exist yet
    }
    
    return {
        totalProspects,
        prospectFiles: prospectFiles.length
    };
}

function analyzePerformance(campaigns, responses) {
    const stats = {
        totalEmailsSent: 0,
        totalResponses: responses.responses.length,
        responseRate: 0,
        segmentPerformance: {},
        recentActivity: {
            emailsSent: 0,
            responsesReceived: 0,
            autoresponsesSent: responses.autoresponderLog.length
        }
    };
    
    // Analyze campaigns
    const recentCutoff = getRecentActivity();
    
    campaigns.forEach(campaign => {
        stats.totalEmailsSent += campaign.prospects?.length || 0;
        
        const segment = campaign.segment || 'unknown';
        if (!stats.segmentPerformance[segment]) {
            stats.segmentPerformance[segment] = {
                sent: 0,
                responses: 0,
                rate: 0
            };
        }
        stats.segmentPerformance[segment].sent += campaign.prospects?.length || 0;
        
        // Recent activity
        const campaignDate = new Date(campaign.createdAt || campaign.timestamp);
        if (campaignDate > recentCutoff) {
            stats.recentActivity.emailsSent += campaign.prospects?.length || 0;
        }
    });
    
    // Analyze responses
    responses.responses.forEach(response => {
        const responseDate = new Date(response.timestamp);
        if (responseDate > recentCutoff) {
            stats.recentActivity.responsesReceived++;
        }
        
        // Match responses to segments (simplified)
        const email = response.email;
        if (email.includes('marketing') || email.includes('cmo')) {
            stats.segmentPerformance['marketing'] = stats.segmentPerformance['marketing'] || { sent: 0, responses: 0, rate: 0 };
            stats.segmentPerformance['marketing'].responses++;
        }
    });
    
    // Calculate rates
    if (stats.totalEmailsSent > 0) {
        stats.responseRate = ((stats.totalResponses / stats.totalEmailsSent) * 100).toFixed(2);
    }
    
    Object.keys(stats.segmentPerformance).forEach(segment => {
        const perf = stats.segmentPerformance[segment];
        if (perf.sent > 0) {
            perf.rate = ((perf.responses / perf.sent) * 100).toFixed(2);
        }
    });
    
    return stats;
}

function getLeadQuality(responses) {
    const leads = {
        hot: [],
        warm: [],
        cold: [],
        qualified: 0
    };
    
    responses.responses.forEach(response => {
        const content = response.content.toLowerCase();
        const type = response.type;
        
        if (type === 'report_request' || content.includes('call') || content.includes('meeting')) {
            leads.hot.push({
                email: response.email,
                type: response.type,
                timestamp: response.timestamp,
                interest: 'HIGH'
            });
        } else if (type === 'interested' || content.includes('interesting') || content.includes('more info')) {
            leads.warm.push({
                email: response.email,
                type: response.type,
                timestamp: response.timestamp,
                interest: 'MEDIUM'
            });
        } else if (type !== 'not_interested') {
            leads.cold.push({
                email: response.email,
                type: response.type,
                timestamp: response.timestamp,
                interest: 'LOW'
            });
        }
    });
    
    leads.qualified = leads.hot.length + leads.warm.length;
    return leads;
}

function displayDashboard() {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 MASTER CAMPAIGN DASHBOARD - Cold Email System Overview');
    console.log('='.repeat(80));
    
    // Get all data
    const campaigns = getCampaignOverview();
    const responses = getResponseOverview();
    const prospectStats = getProspectStats();
    const performance = analyzePerformance(campaigns, responses);
    const leads = getLeadQuality(responses);
    
    // 1. Quick Stats Overview
    console.log('\n📊 QUICK STATS OVERVIEW');
    console.log('─'.repeat(50));
    console.log(`📧 Total Emails Sent:     ${performance.totalEmailsSent.toLocaleString()}`);
    console.log(`📥 Total Responses:       ${performance.totalResponses}`);
    console.log(`📈 Response Rate:         ${performance.responseRate}%`);
    console.log(`🎯 Qualified Leads:       ${leads.qualified}`);
    console.log(`📁 Prospect Files:        ${prospectStats.prospectFiles}`);
    console.log(`👥 Total Prospects:       ${prospectStats.totalProspects.toLocaleString()}`);
    
    // 2. Recent Activity (Last 7 Days)
    console.log('\n⚡ RECENT ACTIVITY (Last 7 Days)');
    console.log('─'.repeat(50));
    console.log(`📤 Emails Sent:           ${performance.recentActivity.emailsSent}`);
    console.log(`📨 Responses Received:    ${performance.recentActivity.responsesReceived}`);
    console.log(`🤖 Autoresponses Sent:   ${performance.recentActivity.autoresponsesSent}`);
    
    if (performance.recentActivity.emailsSent > 0) {
        const recentRate = ((performance.recentActivity.responsesReceived / performance.recentActivity.emailsSent) * 100).toFixed(2);
        console.log(`📊 Recent Response Rate:  ${recentRate}%`);
    }
    
    // 3. Campaign Performance by Segment
    if (Object.keys(performance.segmentPerformance).length > 0) {
        console.log('\n🎯 SEGMENT PERFORMANCE');
        console.log('─'.repeat(50));
        Object.entries(performance.segmentPerformance).forEach(([segment, stats]) => {
            console.log(`${segment.toUpperCase().padEnd(15)} | Sent: ${stats.sent.toString().padStart(4)} | Responses: ${stats.responses.toString().padStart(2)} | Rate: ${stats.rate}%`);
        });
    }
    
    // 4. Lead Quality Breakdown
    console.log('\n🔥 LEAD QUALITY BREAKDOWN');
    console.log('─'.repeat(50));
    console.log(`🌶️  HOT Leads (Ready to buy):     ${leads.hot.length}`);
    console.log(`🔥 WARM Leads (Interested):       ${leads.warm.length}`);
    console.log(`❄️  COLD Leads (Need nurturing):   ${leads.cold.length}`);
    
    // 5. Hot Leads Details
    if (leads.hot.length > 0) {
        console.log('\n🌶️ HOT LEADS REQUIRING IMMEDIATE ATTENTION');
        console.log('─'.repeat(70));
        leads.hot.slice(0, 5).forEach(lead => {
            console.log(`📧 ${lead.email.padEnd(30)} | ${lead.interest} | ${formatDate(lead.timestamp)}`);
        });
        if (leads.hot.length > 5) {
            console.log(`   ... and ${leads.hot.length - 5} more hot leads`);
        }
    }
    
    // 6. Recent Responses
    if (responses.responses.length > 0) {
        console.log('\n📨 RECENT RESPONSES');
        console.log('─'.repeat(70));
        const recentResponses = responses.responses
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);
        
        recentResponses.forEach(response => {
            const typeIcon = {
                'report_request': '📊',
                'interested': '💡',
                'call_request': '📞',
                'questions': '❓',
                'not_interested': '🚫',
                'timing': '⏰'
            };
            
            const icon = typeIcon[response.type] || '📧';
            const preview = response.content.substring(0, 40) + '...';
            console.log(`${icon} ${response.email.padEnd(25)} | ${preview.padEnd(45)} | ${formatDate(response.timestamp)}`);
        });
    }
    
    // 7. System Health
    console.log('\n🛠️ SYSTEM HEALTH');
    console.log('─'.repeat(50));
    
    const campaignFiles = campaigns.length > 0 ? '✅' : '⚠️';
    const responseSystem = responses.responses.length >= 0 ? '✅' : '⚠️';
    const autoresponder = responses.autoresponderLog.length >= 0 ? '✅' : '⚠️';
    const prospects = prospectStats.totalProspects > 0 ? '✅' : '⚠️';
    
    console.log(`Campaign System:     ${campaignFiles} ${campaigns.length} campaigns loaded`);
    console.log(`Response Tracker:    ${responseSystem} ${responses.responses.length} responses logged`);
    console.log(`Autoresponder:       ${autoresponder} ${responses.autoresponderLog.length} autoresponses sent`);
    console.log(`Prospect Database:   ${prospects} ${prospectStats.totalProspects.toLocaleString()} prospects available`);
    
    // 8. Recommended Actions
    console.log('\n🎯 RECOMMENDED ACTIONS');
    console.log('─'.repeat(50));
    
    if (leads.hot.length > 0) {
        console.log(`🔥 URGENT: ${leads.hot.length} hot leads need personal follow-up`);
    }
    
    if (performance.recentActivity.emailsSent === 0) {
        console.log('📤 Consider launching new campaign batches');
    }
    
    if (performance.responseRate > 0 && parseFloat(performance.responseRate) > 2) {
        console.log('📈 Great response rate! Consider scaling up sending volume');
    }
    
    if (performance.recentActivity.responsesReceived > performance.recentActivity.autoresponsesSent) {
        console.log('🤖 Some responses may need autoresponder processing');
    }
    
    if (prospectStats.totalProspects > 1000 && performance.totalEmailsSent < 100) {
        console.log('🚀 Large prospect database available - ready for bigger campaigns');
    }
    
    // 9. Quick Commands
    console.log('\n⚡ QUICK COMMANDS');
    console.log('─'.repeat(50));
    console.log('Launch new campaign:     node campaign-launcher.js');
    console.log('Check responses:         node response-tracker.js dashboard');
    console.log('Process response:        node response-integration.js quick [email] [response]');
    console.log('View autoresponder:      node campaign-autoresponder.js stats');
    console.log('Generate prospects:      node prospect-segmenter.js');
    console.log('Update dashboard:        node master-dashboard.js');
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 Campaign System Ready | Last Updated: ' + new Date().toLocaleString());
    console.log('='.repeat(80) + '\n');
}

// Handle command line arguments
const command = process.argv[2];

switch (command) {
    case 'leads':
        // Show detailed lead breakdown
        const responses = getResponseOverview();
        const leads = getLeadQuality(responses);
        
        console.log('\n🔥 DETAILED LEAD BREAKDOWN');
        console.log('='.repeat(60));
        
        if (leads.hot.length > 0) {
            console.log('\n🌶️ HOT LEADS (Immediate Action Required):');
            leads.hot.forEach(lead => {
                console.log(`  📧 ${lead.email} - ${lead.type} - ${formatDate(lead.timestamp)}`);
            });
        }
        
        if (leads.warm.length > 0) {
            console.log('\n🔥 WARM LEADS (Follow-up Soon):');
            leads.warm.forEach(lead => {
                console.log(`  📧 ${lead.email} - ${lead.type} - ${formatDate(lead.timestamp)}`);
            });
        }
        break;
        
    case 'performance':
        // Show detailed performance metrics
        const campaigns = getCampaignOverview();
        const responseData = getResponseOverview();
        const performance = analyzePerformance(campaigns, responseData);
        
        console.log('\n📊 DETAILED PERFORMANCE ANALYSIS');
        console.log('='.repeat(60));
        console.log(`Total Campaigns: ${campaigns.length}`);
        console.log(`Total Emails Sent: ${performance.totalEmailsSent}`);
        console.log(`Total Responses: ${performance.totalResponses}`);
        console.log(`Overall Response Rate: ${performance.responseRate}%`);
        
        console.log('\nSegment Performance:');
        Object.entries(performance.segmentPerformance).forEach(([segment, stats]) => {
            console.log(`  ${segment}: ${stats.sent} sent, ${stats.responses} responses (${stats.rate}%)`);
        });
        break;
        
    default:
        displayDashboard();
        break;
}
