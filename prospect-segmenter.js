#!/usr/bin/env node

// Prospect Segmenter - Generate targeted prospect lists for cold email campaigns
// Segments prospects by industry and role for personalized messaging

const fs = require('fs');
const path = require('path');

// File paths
const MAIN_PROSPECTS_FILE = './prospect-lists.json';
const OUTPUT_DIR = './data/prospects';

// Segment definitions
const SEGMENTS = {
    'data-science': {
        name: 'Data Science Professionals',
        keywords: ['data scientist', 'data analyst', 'machine learning', 'ai engineer', 'analytics', 'data engineer', 'statistician', 'research scientist'],
        domains: ['research', 'analytics', 'tech', 'ai', 'ml'],
        targetCount: 100
    },
    'marketing': {
        name: 'Marketing Executives',
        keywords: ['marketing manager', 'cmo', 'marketing director', 'content manager', 'digital marketing', 'growth marketing', 'marketing lead'],
        domains: ['marketing', 'agency', 'advertising', 'media', 'brand'],
        targetCount: 100
    },
    'business': {
        name: 'Business Owners',
        keywords: ['ceo', 'founder', 'owner', 'president', 'managing director', 'business owner', 'executive'],
        domains: ['business', 'consulting', 'services', 'commerce'],
        targetCount: 100
    },
    'startup': {
        name: 'Startup Founders',
        keywords: ['startup founder', 'co-founder', 'startup ceo', 'entrepreneur', 'startup', 'venture'],
        domains: ['startup', 'tech', 'innovation', 'venture'],
        targetCount: 100
    },
    'consulting': {
        name: 'Consultants & Agencies',
        keywords: ['consultant', 'consulting', 'agency owner', 'principal', 'partner', 'advisory'],
        domains: ['consulting', 'agency', 'advisory', 'services'],
        targetCount: 100
    },
    'tech': {
        name: 'Tech Professionals',
        keywords: ['cto', 'vp engineering', 'tech lead', 'product manager', 'software engineer', 'developer', 'it director'],
        domains: ['tech', 'software', 'saas', 'technology', 'engineering'],
        targetCount: 100
    }
};

// Utility functions
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function loadProspects() {
    try {
        const data = fs.readFileSync(MAIN_PROSPECTS_FILE, 'utf8');
        const prospectData = JSON.parse(data);
        
        // Extract all sample prospects from each segment
        let allProspects = [];
        Object.keys(prospectData).forEach(segmentKey => {
            if (prospectData[segmentKey].sample_prospects) {
                const prospects = prospectData[segmentKey].sample_prospects.map(prospect => ({
                    ...prospect,
                    name: `${prospect.firstName} ${prospect.lastName}`,
                    originalSegment: segmentKey
                }));
                allProspects = allProspects.concat(prospects);
            }
        });
        
        return allProspects;
    } catch (error) {
        console.error('❌ Error loading prospect file:', error.message);
        process.exit(1);
    }
}

function normalizeText(text) {
    return text.toLowerCase().trim();
}

function scoreProspectForSegment(prospect, segment) {
    let score = 0;
    const prospectText = `${prospect.name || ''} ${prospect.company || ''} ${prospect.title || ''} ${prospect.industry || ''}`.toLowerCase();
    
    // Check keywords in all prospect fields
    segment.keywords.forEach(keyword => {
        if (prospectText.includes(keyword.toLowerCase())) {
            score += 2;
        }
    });
    
    // Check domain matches
    segment.domains.forEach(domain => {
        if (prospectText.includes(domain.toLowerCase())) {
            score += 1;
        }
    });
    
    // Bonus for email domain patterns
    if (prospect.email) {
        const emailDomain = prospect.email.split('@')[1]?.toLowerCase() || '';
        segment.domains.forEach(domain => {
            if (emailDomain.includes(domain)) {
                score += 1;
            }
        });
    }
    
    return score;
}

function segmentProspects(prospects) {
    const segmentedProspects = {};
    
    // Initialize segments
    Object.keys(SEGMENTS).forEach(segmentKey => {
        segmentedProspects[segmentKey] = [];
    });
    
    // Score each prospect for each segment
    prospects.forEach(prospect => {
        let bestSegment = null;
        let bestScore = 0;
        
        Object.keys(SEGMENTS).forEach(segmentKey => {
            const score = scoreProspectForSegment(prospect, SEGMENTS[segmentKey]);
            if (score > bestScore) {
                bestScore = score;
                bestSegment = segmentKey;
            }
        });
        
        // Only assign if we have a reasonable match
        if (bestScore > 0 && bestSegment) {
            segmentedProspects[bestSegment].push({
                ...prospect,
                segment: bestSegment,
                segmentScore: bestScore
            });
        } else {
            // Default segment for unmatched prospects
            segmentedProspects['business'].push({
                ...prospect,
                segment: 'business',
                segmentScore: 0
            });
        }
    });
    
    return segmentedProspects;
}

function generateSegmentFiles(segmentedProspects) {
    ensureDir(OUTPUT_DIR);
    const summary = {};
    
    Object.keys(SEGMENTS).forEach(segmentKey => {
        const segment = SEGMENTS[segmentKey];
        const prospects = segmentedProspects[segmentKey] || [];
        
        // Sort by score (highest first) and take target count
        const sortedProspects = prospects
            .sort((a, b) => b.segmentScore - a.segmentScore)
            .slice(0, segment.targetCount);
        
        // Generate file
        const filename = `${segmentKey}-prospects.json`;
        const filepath = path.join(OUTPUT_DIR, filename);
        
        fs.writeFileSync(filepath, JSON.stringify(sortedProspects, null, 2));
        
        summary[segmentKey] = {
            name: segment.name,
            count: sortedProspects.length,
            file: filename,
            averageScore: sortedProspects.length > 0 ? 
                (sortedProspects.reduce((sum, p) => sum + p.segmentScore, 0) / sortedProspects.length).toFixed(2) : 0
        };
        
        console.log(`✅ ${segment.name}: ${sortedProspects.length} prospects → ${filename}`);
    });
    
    return summary;
}

function createPhaseFiles(segmentedProspects) {
    // Create smaller phase files for gradual launch
    Object.keys(SEGMENTS).forEach(segmentKey => {
        const prospects = segmentedProspects[segmentKey] || [];
        
        if (prospects.length > 0) {
            // Phase 1: First 10 prospects (for initial testing)
            const phase1 = prospects.slice(0, 10);
            const phase1File = path.join(OUTPUT_DIR, `${segmentKey}-phase1.json`);
            fs.writeFileSync(phase1File, JSON.stringify(phase1, null, 2));
            
            // Phase 2: Next 20 prospects
            const phase2 = prospects.slice(10, 30);
            const phase2File = path.join(OUTPUT_DIR, `${segmentKey}-phase2.json`);
            fs.writeFileSync(phase2File, JSON.stringify(phase2, null, 2));
            
            console.log(`📁 Created phase files for ${segmentKey}: ${phase1.length} + ${phase2.length} prospects`);
        }
    });
}

function displaySummary(summary) {
    console.log('\n' + '='.repeat(70));
    console.log('📊 PROSPECT SEGMENTATION COMPLETE');
    console.log('='.repeat(70));
    
    let totalProspects = 0;
    Object.keys(summary).forEach(segmentKey => {
        const segment = summary[segmentKey];
        totalProspects += segment.count;
        console.log(`🎯 ${segment.name.padEnd(25)} | ${segment.count.toString().padStart(3)} prospects | Avg Score: ${segment.averageScore}`);
    });
    
    console.log('─'.repeat(70));
    console.log(`📈 Total Prospects Segmented: ${totalProspects}`);
    console.log(`📁 Files Generated: ${OUTPUT_DIR}/`);
    
    console.log('\n🚀 READY TO LAUNCH CAMPAIGNS');
    console.log('─'.repeat(40));
    console.log('Next steps:');
    console.log('1. Launch Phase 1: node campaign-launcher.js');
    console.log('2. Monitor: node master-dashboard.js');
    console.log('3. Scale: node gradual-launch-strategy.js');
    
    console.log('\n✨ Your cold email campaigns are ready to launch!');
}

// Main execution
function main() {
    console.log('🔄 Starting Prospect Segmentation...');
    console.log('─'.repeat(50));
    
    // Load prospects
    console.log('📂 Loading prospect database...');
    const prospects = loadProspects();
    console.log(`✅ Loaded ${prospects.length} total prospects`);
    
    // Segment prospects
    console.log('\n🎯 Segmenting prospects by audience...');
    const segmentedProspects = segmentProspects(prospects);
    
    // Generate files
    console.log('\n📁 Generating segment files...');
    const summary = generateSegmentFiles(segmentedProspects);
    
    // Create phase files for gradual launch
    console.log('\n📋 Creating phase files for gradual launch...');
    createPhaseFiles(segmentedProspects);
    
    // Display summary
    displaySummary(summary);
}

// Handle command line arguments
const command = process.argv[2];

switch (command) {
    case 'stats':
        // Show current segmentation stats
        try {
            ensureDir(OUTPUT_DIR);
            const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('-prospects.json'));
            
            console.log('\n📊 CURRENT SEGMENTATION STATUS');
            console.log('='.repeat(50));
            
            files.forEach(file => {
                const prospects = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, file), 'utf8'));
                const segmentName = file.replace('-prospects.json', '');
                console.log(`${segmentName.padEnd(15)} | ${prospects.length} prospects`);
            });
        } catch (error) {
            console.log('❌ No segmented prospects found. Run without arguments to segment.');
        }
        break;
        
    default:
        main();
        break;
}
