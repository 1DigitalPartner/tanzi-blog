#!/usr/bin/env node
/**
 * Landing Page API Server
 * Handles form submissions from the Data Science Report landing page
 * Automatically sends the report via email when someone submits their info
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const CampaignAutoresponder = require('./campaign-autoresponder.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files from current directory

class LandingPageAPI {
    constructor() {
        this.autoresponder = new CampaignAutoresponder();
        this.leadsFile = path.join(__dirname, 'landing-page-leads.json');
        this.setupRoutes();
        
        console.log('🚀 Landing Page API initialized');
    }

    setupRoutes() {
        // Serve the landing page
        app.get('/', (req, res) => {
            res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Get Your Data Science Intelligence Report</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            min-height: 100vh;
        }
        .container { max-width: 600px; margin: 0 auto; }
        h1 { font-size: 2.5em; margin-bottom: 30px; }
        .email-link { 
            display: inline-block; 
            background: #10b981; 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-size: 18px; 
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Get Your FREE Data Science Intelligence Report</h1>
        <p>Simply send an email to get instant access to our comprehensive analysis of 118,001 social media interactions!</p>
        <a href="mailto:gabriele.tanzitech@gmail.com?subject=Data%20Science%20Report%20Request&body=Hi%20Gabriele,%0A%0APlease%20send%20me%20the%20complete%20Data%20Science%20Intelligence%20Report.%0A%0AName:%20[Your%20Name]%0ARole:%20[Your%20Role]%0ACompany:%20[Your%20Company]%0A%0AThanks!" class="email-link">📧 Send Report Request Email</a>
        <p><strong>Or simply reply "SEND REPORT" to any of our campaign emails!</strong></p>
        <hr style="margin: 40px 0; opacity: 0.3;">
        <h3>What You'll Discover:</h3>
        <ul style="text-align: left; max-width: 500px; margin: 0 auto;">
            <li>📊 The 110-Character Formula that drives 3x more engagement</li>
            <li>🎯 Why Reddit generates 6.4x more engagement than Twitter</li>
            <li>🔥 5 psychological triggers behind viral content</li>
            <li>💡 Why questions kill engagement (shocking data inside)</li>
            <li>📈 Complete platform optimization strategies</li>
        </ul>
    </div>
</body>
</html>
            `);
        });

        // Health check endpoint
        app.get('/health', (req, res) => {
            res.json({ 
                status: 'healthy', 
                timestamp: new Date().toISOString(),
                service: 'Landing Page API'
            });
        });

        // API endpoint to handle report requests
        app.post('/api/send-report', async (req, res) => {
            try {
                const result = await this.handleReportRequest(req.body);
                res.json(result);
            } catch (error) {
                console.error('API Error:', error);
                res.status(500).json({ 
                    success: false, 
                    error: 'Internal server error',
                    message: 'Failed to process your request. Please try again.'
                });
            }
        });

        // Get leads statistics (for admin use)
        app.get('/api/leads/stats', async (req, res) => {
            try {
                const stats = await this.getLeadsStats();
                res.json(stats);
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }

    /**
     * Handle report request from landing page
     */
    async handleReportRequest(data) {
        console.log(`📝 New lead: ${data.email} (${data.firstName})`);
        
        // Validate required fields
        if (!data.email || !data.firstName) {
            throw new Error('Email and first name are required');
        }

        // Save lead to database/file
        await this.saveLead(data);

        // Send the report via email using autoresponder
        const reportDelivery = await this.deliverReport(data);

        return {
            success: true,
            message: 'Report sent successfully!',
            leadId: data.timestamp,
            emailSent: reportDelivery.success
        };
    }

    /**
     * Save lead information
     */
    async saveLead(data) {
        let leads = [];
        
        try {
            const existingData = await fs.readFile(this.leadsFile, 'utf8');
            leads = JSON.parse(existingData);
        } catch (error) {
            // File doesn't exist, start with empty array
        }

        const leadData = {
            id: `lead_${Date.now()}`,
            firstName: data.firstName,
            email: data.email,
            role: data.role || 'Unknown',
            company: data.company || '',
            source: data.source || 'landing_page',
            utmSource: data.utmSource || 'direct',
            utmCampaign: data.utmCampaign || 'data_science_insights',
            timestamp: data.timestamp || new Date().toISOString(),
            status: 'new',
            reportSent: false
        };

        leads.push(leadData);
        await fs.writeFile(this.leadsFile, JSON.stringify(leads, null, 2));
        
        console.log(`💾 Lead saved: ${leadData.id}`);
        return leadData.id;
    }

    /**
     * Deliver the report via email
     */
    async deliverReport(data) {
        try {
            // Use the autoresponder system to send the report
            const result = await this.autoresponder.processIncomingResponse({
                email: data.email,
                firstName: data.firstName,
                company: data.company || '',
                responseContent: `LANDING PAGE REQUEST: Please send me the complete DATA science intelligence report with all insights and analysis.`,
                campaignId: 'landing_page_capture',
                audienceSegment: this.mapRoleToSegment(data.role)
            });

            if (result.processed) {
                // Update lead status
                await this.updateLeadStatus(data.email, { reportSent: true, status: 'report_delivered' });
                
                console.log(`✅ Report delivered to ${data.email} via email`);
                return { success: true, responseType: result.responseType };
            } else {
                throw new Error('Failed to process report delivery');
            }

        } catch (error) {
            console.error(`❌ Failed to deliver report to ${data.email}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Map role to audience segment for autoresponder
     */
    mapRoleToSegment(role) {
        const roleMap = {
            'Data Scientist': 'data_science_professionals',
            'ML Engineer': 'data_science_professionals',
            'Marketing Executive': 'marketing_executives',
            'Business Owner': 'business_owners',
            'Startup Founder': 'startup_founders',
            'Consultant': 'consultants_agencies',
            'Tech Professional': 'tech_professionals'
        };
        
        return roleMap[role] || 'data_science_professionals';
    }

    /**
     * Update lead status
     */
    async updateLeadStatus(email, updates) {
        try {
            const leadsData = await fs.readFile(this.leadsFile, 'utf8');
            const leads = JSON.parse(leadsData);
            
            const leadIndex = leads.findIndex(lead => lead.email === email);
            if (leadIndex !== -1) {
                leads[leadIndex] = { ...leads[leadIndex], ...updates, lastUpdated: new Date().toISOString() };
                await fs.writeFile(this.leadsFile, JSON.stringify(leads, null, 2));
            }
        } catch (error) {
            console.error('Failed to update lead status:', error);
        }
    }

    /**
     * Get leads statistics
     */
    async getLeadsStats() {
        try {
            const leadsData = await fs.readFile(this.leadsFile, 'utf8');
            const leads = JSON.parse(leadsData);
            
            const stats = {
                totalLeads: leads.length,
                reportsDelivered: leads.filter(lead => lead.reportSent).length,
                todayLeads: leads.filter(lead => {
                    const today = new Date().toDateString();
                    return new Date(lead.timestamp).toDateString() === today;
                }).length,
                roleBreakdown: {},
                sourceBreakdown: {},
                recentLeads: leads.slice(-5).reverse()
            };

            // Calculate role breakdown
            leads.forEach(lead => {
                stats.roleBreakdown[lead.role] = (stats.roleBreakdown[lead.role] || 0) + 1;
                stats.sourceBreakdown[lead.source] = (stats.sourceBreakdown[lead.source] || 0) + 1;
            });

            return stats;
        } catch (error) {
            return {
                totalLeads: 0,
                reportsDelivered: 0,
                todayLeads: 0,
                roleBreakdown: {},
                sourceBreakdown: {},
                recentLeads: []
            };
        }
    }

    /**
     * Start the server
     */
    start() {
        app.listen(PORT, () => {
            console.log('\n🌐 LANDING PAGE API SERVER RUNNING');
            console.log('==================================');
            console.log(`🚀 Server: http://localhost:${PORT}`);
            console.log(`📊 Landing Page: http://localhost:${PORT}/`);
            console.log(`📈 Health Check: http://localhost:${PORT}/health`);
            console.log(`📋 Lead Stats: http://localhost:${PORT}/api/leads/stats`);
            console.log('');
            console.log('✅ Ready to capture leads and deliver reports automatically!');
            console.log('📧 Reports will be sent via the integrated autoresponder system');
            console.log('');
        });
    }
}

// CLI interface
if (require.main === module) {
    const command = process.argv[2];
    const api = new LandingPageAPI();
    
    switch (command) {
        case 'start':
        case undefined:
            api.start();
            break;

        case 'stats':
            api.getLeadsStats().then(stats => {
                console.log('\n📊 Landing Page Lead Statistics:');
                console.log('=================================');
                console.log(`Total Leads: ${stats.totalLeads}`);
                console.log(`Reports Delivered: ${stats.reportsDelivered}`);
                console.log(`Today's Leads: ${stats.todayLeads}`);
                console.log('\nRole Breakdown:');
                Object.entries(stats.roleBreakdown).forEach(([role, count]) => {
                    console.log(`  ${role}: ${count}`);
                });
                console.log('\nRecent Leads:');
                stats.recentLeads.forEach(lead => {
                    console.log(`  ${lead.email} (${lead.firstName}) - ${new Date(lead.timestamp).toLocaleDateString()}`);
                });
            });
            break;

        case 'test':
            // Test the API with sample data
            const testData = {
                firstName: 'John',
                email: 'test@example.com',
                role: 'Data Scientist',
                source: 'landing_page_test',
                timestamp: new Date().toISOString()
            };
            
            api.handleReportRequest(testData).then(result => {
                console.log('✅ Test completed:', result);
            }).catch(error => {
                console.error('❌ Test failed:', error.message);
            });
            break;

        default:
            console.log(`
🌐 Landing Page API Server

Commands:
  start     Start the API server (default)
  stats     Show lead capture statistics  
  test      Test the lead capture system

Features:
✅ Professional landing page with email capture
✅ Automatic report delivery via email
✅ Lead tracking and analytics
✅ Integration with autoresponder system
✅ Role-based audience segmentation

The system will:
1. 📱 Serve the landing page at http://localhost:${PORT}
2. 📝 Capture lead information from form submissions
3. 📊 Automatically send the Data Science Intelligence Report
4. 💾 Save all leads for follow-up and analytics
5. 📈 Provide statistics and conversion tracking

Usage:
  node landing-page-api.js start
            `);
    }
}

module.exports = LandingPageAPI;
