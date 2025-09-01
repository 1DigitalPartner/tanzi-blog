/**
 * Create Test Prospect Files for Data Science Cold Email Campaign
 * Extracts smaller, manageable lists from the large prospect database
 */

const fs = require('fs').promises;
const path = require('path');

class TestProspectFileCreator {
    constructor() {
        this.sourceFile = path.join(__dirname, 'email-list-social_media_campaign.json');
        this.segments = {
            'data_science_professionals': 50,
            'marketing_executives': 50, 
            'business_owners': 50,
            'startup_founders': 30,
            'consultants_agencies': 35,
            'tech_professionals': 35
        };
    }

    /**
     * Load the source prospect list
     */
    async loadSourceProspects() {
        try {
            const data = await fs.readFile(this.sourceFile, 'utf8');
            const prospects = JSON.parse(data);
            console.log(`📊 Loaded ${prospects.length.toLocaleString()} prospects from source file`);
            return prospects;
        } catch (error) {
            console.error('❌ Error loading source prospects:', error.message);
            return [];
        }
    }

    /**
     * Shuffle array for random selection
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Extract name from email address
     */
    extractNameFromEmail(email) {
        const localPart = email.split('@')[0];
        const parts = localPart.split(/[._-]/);
        
        // Capitalize first letters
        const firstName = parts[0] ? this.capitalizeFirst(parts[0]) : 'there';
        const lastName = parts[1] ? this.capitalizeFirst(parts[1]) : '';
        
        return { firstName, lastName, fullName: `${firstName} ${lastName}`.trim() };
    }

    /**
     * Capitalize first letter
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    /**
     * Generate company name from email domain
     */
    generateCompanyName(email) {
        const domain = email.split('@')[1];
        if (!domain) return 'Unknown Company';
        
        // Handle common email providers
        const commonProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
        if (commonProviders.includes(domain)) {
            return 'Self-employed'; // Generic for personal email addresses
        }
        
        // Extract company name from domain
        const companyPart = domain.split('.')[0];
        return this.capitalizeFirst(companyPart);
    }

    /**
     * Create CSV content for a segment
     */
    createCSVContent(prospects, segmentName) {
        const header = 'Email,FirstName,LastName,Title,Company,Industry';
        
        const rows = prospects.map(prospect => {
            const { firstName, lastName } = this.extractNameFromEmail(prospect.email);
            const company = this.generateCompanyName(prospect.email);
            const { title, industry } = this.generateTitleAndIndustry(segmentName, company);
            
            return `"${prospect.email}","${firstName}","${lastName}","${title}","${company}","${industry}"`;
        });
        
        return [header, ...rows].join('\n');
    }

    /**
     * Generate realistic title and industry based on segment
     */
    generateTitleAndIndustry(segmentName, company) {
        const segmentProfiles = {
            'data_science_professionals': {
                titles: ['Data Scientist', 'ML Engineer', 'Data Engineer', 'Research Scientist', 'Analytics Manager', 'Senior Data Scientist'],
                industries: ['Technology', 'Machine Learning', 'Analytics', 'AI/ML', 'Big Data', 'Tech Services']
            },
            'marketing_executives': {
                titles: ['Marketing Director', 'CMO', 'VP Marketing', 'Marketing Manager', 'Brand Manager', 'Digital Marketing Manager'],
                industries: ['B2B Software', 'SaaS', 'Technology', 'Marketing', 'Digital Marketing', 'E-commerce']
            },
            'business_owners': {
                titles: ['CEO', 'President', 'Founder', 'Owner', 'Managing Director', 'Principal'],
                industries: ['B2B Services', 'Consulting', 'Professional Services', 'Technology', 'Business Services', 'Consulting']
            },
            'startup_founders': {
                titles: ['Founder', 'Co-Founder', 'CEO', 'CTO', 'Founder & CEO', 'Co-Founder & CTO'],
                industries: ['Startup', 'Technology', 'SaaS', 'Fintech', 'AI/ML', 'Tech Startup']
            },
            'consultants_agencies': {
                titles: ['Consultant', 'Principal Consultant', 'Agency Owner', 'Managing Director', 'Account Director', 'Senior Consultant'],
                industries: ['Consulting', 'Marketing Agency', 'Digital Agency', 'Business Services', 'Strategy', 'Professional Services']
            },
            'tech_professionals': {
                titles: ['Software Engineer', 'Senior Developer', 'Technical Lead', 'Engineering Manager', 'Product Manager', 'Software Architect'],
                industries: ['Technology', 'Software', 'SaaS', 'Tech Services', 'IT', 'Software Development']
            }
        };

        const profile = segmentProfiles[segmentName] || segmentProfiles['tech_professionals'];
        const randomTitle = profile.titles[Math.floor(Math.random() * profile.titles.length)];
        const randomIndustry = profile.industries[Math.floor(Math.random() * profile.industries.length)];
        
        return { title: randomTitle, industry: randomIndustry };
    }

    /**
     * Create all test prospect files
     */
    async createTestFiles() {
        console.log('\n🎯 Creating Test Prospect Files for Phase 1 Launch\n');
        console.log('═══════════════════════════════════════════════════\n');

        const allProspects = await this.loadSourceProspects();
        if (allProspects.length === 0) {
            console.error('❌ No prospects loaded. Cannot create test files.');
            return;
        }

        // Shuffle for random selection
        const shuffledProspects = this.shuffleArray(allProspects);
        let currentIndex = 0;
        let totalCreated = 0;

        for (const [segmentName, count] of Object.entries(this.segments)) {
            console.log(`📧 Creating ${segmentName.replace(/_/g, ' ')} list (${count} prospects)...`);
            
            // Extract prospects for this segment
            const segmentProspects = shuffledProspects.slice(currentIndex, currentIndex + count);
            currentIndex += count;
            
            // Create CSV content
            const csvContent = this.createCSVContent(segmentProspects, segmentName);
            
            // Write to file
            const filename = `test-prospects-${segmentName}.csv`;
            const filepath = path.join(__dirname, filename);
            await fs.writeFile(filepath, csvContent);
            
            console.log(`   ✅ Created ${filename} with ${segmentProspects.length} prospects`);
            totalCreated += segmentProspects.length;
        }

        console.log(`\n📊 Phase 1 Test Files Created:`);
        console.log(`   🎯 Total Files: ${Object.keys(this.segments).length}`);
        console.log(`   📧 Total Prospects: ${totalCreated}`);
        console.log(`   📈 Expected Replies: ~${Math.round(totalCreated * 0.15)}`);
        console.log(`   💰 Expected Leads: ~${Math.round(totalCreated * 0.04)}`);
        
        console.log(`\n🚀 Ready to Launch Phase 1 Campaigns!`);
        console.log(`   Next command: node data-science-cold-campaign-launcher.js launch-phase-1`);
        
        return {
            totalFiles: Object.keys(this.segments).length,
            totalProspects: totalCreated,
            segments: this.segments
        };
    }

    /**
     * Create a single large mixed file for testing
     */
    async createMixedTestFile(size = 100) {
        console.log(`\n📧 Creating Mixed Test File (${size} prospects)...`);
        
        const allProspects = await this.loadSourceProspects();
        const shuffledProspects = this.shuffleArray(allProspects);
        const selectedProspects = shuffledProspects.slice(0, size);
        
        // Mix of different segments
        const csvContent = this.createCSVContent(selectedProspects, 'marketing_executives');
        const filename = `test-prospects-mixed-${size}.csv`;
        const filepath = path.join(__dirname, filename);
        
        await fs.writeFile(filepath, csvContent);
        console.log(`✅ Created ${filename} with ${selectedProspects.length} prospects`);
        
        return filename;
    }
}

module.exports = TestProspectFileCreator;

// CLI usage
if (require.main === module) {
    const creator = new TestProspectFileCreator();
    
    const command = process.argv[2];
    const param = process.argv[3];
    
    switch (command) {
        case 'phase1':
            creator.createTestFiles().then((result) => {
                if (result) {
                    console.log('\n🎯 Phase 1 files ready! Use these commands to launch:');
                    Object.keys(result.segments).forEach(segment => {
                        console.log(`node data-science-cold-campaign-launcher.js launch ${segment} ./test-prospects-${segment}.csv`);
                    });
                }
            });
            break;
            
        case 'mixed':
            const size = parseInt(param) || 100;
            creator.createMixedTestFile(size).then((filename) => {
                console.log(`\nTo launch with mixed file:`);
                console.log(`node data-science-cold-campaign-launcher.js launch marketing_executives ./${filename}`);
            });
            break;
            
        default:
            console.log(`
🎯 Test Prospect File Creator

Commands:
  phase1                     Create Phase 1 test files (250 total prospects)
  mixed [size]              Create single mixed test file (default: 100 prospects)

Examples:
  node create-test-prospect-files.js phase1
  node create-test-prospect-files.js mixed 50

Phase 1 Distribution:
  📊 Data Science Professionals: 50
  📊 Marketing Executives: 50
  📊 Business Owners: 50
  📊 Startup Founders: 30
  📊 Consultants/Agencies: 35
  📊 Tech Professionals: 35
  
Total: 250 prospects for Phase 1 testing
            `);
    }
}
