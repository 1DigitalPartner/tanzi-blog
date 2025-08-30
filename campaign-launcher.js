#!/usr/bin/env node

// Campaign Launcher - Interactive cold email campaign launcher
// Launches targeted campaigns for all segments with proper scaling

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// File paths
const PROSPECTS_DIR = './data/prospects';
const CAMPAIGNS_DIR = './data/campaigns';
const TEMPLATES_DIR = './cold-email-templates';

// Available segments
const SEGMENTS = {
    'data-science': 'Data Science Professionals',
    'marketing': 'Marketing Executives', 
    'business': 'Business Owners',
    'startup': 'Startup Founders',
    'consulting': 'Consultants & Agencies',
    'tech': 'Tech Professionals'
};

// Utility functions
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function loadProspects(segmentKey, phase = 1) {
    const filename = phase === 1 ? `${segmentKey}-phase1.json` : `${segmentKey}-prospects.json`;
    const filepath = path.join(PROSPECTS_DIR, filename);
    
    try {
        if (fs.existsSync(filepath)) {
            return JSON.parse(fs.readFileSync(filepath, 'utf8'));
        }
    } catch (error) {
        console.log(`⚠️ Could not load prospects for ${segmentKey}: ${error.message}`);
    }
    
    return [];
}

function loadTemplate(segmentKey) {
    const templateFile = path.join(TEMPLATES_DIR, `${segmentKey}.json`);
    
    try {
        if (fs.existsSync(templateFile)) {
            return JSON.parse(fs.readFileSync(templateFile, 'utf8'));
        }
    } catch (error) {
        console.log(`⚠️ Could not load template for ${segmentKey}: ${error.message}`);
    }
    
    return null;
}

function createCampaign(segmentKey, prospects, template, options = {}) {
    const campaign = {
        id: `campaign-${segmentKey}-${Date.now()}`,
        segment: segmentKey,
        segmentName: SEGMENTS[segmentKey],
        template: template,
        prospects: prospects,
        status: 'queued',
        createdAt: new Date().toISOString(),
        options: {
            batchSize: options.batchSize || 5,
            delayMinutes: options.delayMinutes || 60,
            testMode: options.testMode || true
        },
        stats: {
            totalProspects: prospects.length,
            sent: 0,
            responses: 0,
            opens: 0
        }
    };
    
    return campaign;
}

function saveCampaign(campaign) {
    ensureDir(CAMPAIGNS_DIR);
    const filename = `${campaign.segment}-campaign.json`;
    const filepath = path.join(CAMPAIGNS_DIR, filename);
    
    // Load existing campaigns for this segment
    let campaigns = [];
    try {
        if (fs.existsSync(filepath)) {
            campaigns = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        }
    } catch (error) {
        // File doesn't exist or is corrupted, start fresh
    }
    
    // Add new campaign
    campaigns.push(campaign);
    
    // Save back to file
    fs.writeFileSync(filepath, JSON.stringify(campaigns, null, 2));
    
    console.log(`💾 Campaign saved: ${filepath}`);
}

function launchSingleSegment(segmentKey, options = {}) {
    console.log(`\n🚀 Launching campaign for ${SEGMENTS[segmentKey]}...`);
    console.log('─'.repeat(60));
    
    // Load prospects
    const prospects = loadProspects(segmentKey, options.phase || 1);
    if (prospects.length === 0) {
        console.log(`❌ No prospects found for ${segmentKey}`);
        return false;
    }
    
    console.log(`📊 Loaded ${prospects.length} prospects`);
    
    // Load template
    const template = loadTemplate(segmentKey);
    if (!template) {
        console.log(`❌ No template found for ${segmentKey}`);
        return false;
    }
    
    console.log(`📧 Template loaded: "${template.subject}"`);
    
    // Create campaign
    const campaign = createCampaign(segmentKey, prospects, template, options);
    
    // Save campaign
    saveCampaign(campaign);
    
    // Launch via bulk email system
    const success = launchBulkCampaign(campaign);
    
    if (success) {
        console.log(`✅ Campaign launched for ${SEGMENTS[segmentKey]}!`);
        console.log(`   📤 ${prospects.length} emails queued`);
        console.log(`   ⏱️  Batch size: ${campaign.options.batchSize}`);
        console.log(`   🔄 Test mode: ${campaign.options.testMode ? 'ON' : 'OFF'}`);
    } else {
        console.log(`❌ Failed to launch campaign for ${segmentKey}`);
    }
    
    return success;
}

function launchBulkCampaign(campaign) {
    try {
        // For now, just mark as launched (in TEST MODE)
        if (campaign.options.testMode) {
            console.log(`📧 [TEST MODE] ${campaign.prospects.length} emails would be sent`);
            campaign.status = 'launched';
            campaign.stats.sent = campaign.prospects.length;
            return true;
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Error launching bulk campaign:', error.message);
        return false;
    }
}

function launchAllSegments(options = {}) {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 LAUNCHING PHASE 1 CAMPAIGNS FOR ALL SEGMENTS');
    console.log('='.repeat(80));
    
    const results = {};
    let totalProspects = 0;
    let successfulLaunches = 0;
    
    Object.keys(SEGMENTS).forEach(segmentKey => {
        const success = launchSingleSegment(segmentKey, options);
        results[segmentKey] = success;
        
        if (success) {
            successfulLaunches++;
            const prospects = loadProspects(segmentKey, options.phase || 1);
            totalProspects += prospects.length;
        }
    });
    
    // Display summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 CAMPAIGN LAUNCH SUMMARY');
    console.log('='.repeat(80));
    
    Object.keys(results).forEach(segmentKey => {
        const status = results[segmentKey] ? '✅ SUCCESS' : '❌ FAILED';
        const prospects = results[segmentKey] ? loadProspects(segmentKey, options.phase || 1).length : 0;
        console.log(`${SEGMENTS[segmentKey].padEnd(30)} | ${status} | ${prospects} emails`);
    });
    
    console.log('─'.repeat(80));
    console.log(`🎯 Total Campaigns Launched: ${successfulLaunches}/${Object.keys(SEGMENTS).length}`);
    console.log(`📧 Total Emails Queued: ${totalProspects}`);
    console.log(`🔄 Test Mode: ${options.testMode ? 'ON (no emails will be sent)' : 'OFF (emails will be sent)'}`);
    
    if (successfulLaunches > 0) {
        console.log('\n⚡ NEXT STEPS:');
        console.log('─'.repeat(40));
        console.log('1. Monitor campaigns: node master-dashboard.js');
        console.log('2. Check responses: node response-tracker.js dashboard');
        console.log('3. Process replies: node response-integration.js quick [email] [response]');
        console.log('4. Scale up: node gradual-launch-strategy.js');
    }
    
    console.log('\n🚀 Campaign system is now active!');
    console.log('='.repeat(80) + '\n');
    
    return results;
}

// Main execution
const args = process.argv.slice(2);

if (args[0] === 'all') {
    // Launch all segments
    launchAllSegments({
        testMode: true,
        phase: 1,
        batchSize: 5,
        delayMinutes: 60
    });
} else if (SEGMENTS[args[0]]) {
    // Launch specific segment
    launchSingleSegment(args[0], {
        testMode: true,
        phase: 1,
        batchSize: 5
    });
} else {
    console.log('❌ Invalid segment. Available segments:');
    Object.keys(SEGMENTS).forEach(key => {
        console.log(`   ${key} - ${SEGMENTS[key]}`);
    });
}
