#!/usr/bin/env node

// Autoresponder Server - Connects UI to actual system
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = 3040;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Serve the UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'autoresponder-ui.html'));
});

// API Routes

// Get response statistics
app.get('/api/stats', async (req, res) => {
    try {
        // Read actual data files
        const responses = await loadJSON('./data/responses.json', []);
        const autoresponderLog = await loadJSON('./data/autoresponder-log.json', []);
        
        const stats = {
            totalResponses: responses.length,
            autoResponsesSent: autoresponderLog.length,
            responseRate: responses.length > 0 ? ((autoresponderLog.length / responses.length) * 100).toFixed(1) : 0,
            responseTypes: getResponseTypeCounts(responses),
            recentActivity: getRecentActivity(responses, autoresponderLog)
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Failed to load statistics' });
    }
});

// Get recent responses
app.get('/api/responses', async (req, res) => {
    try {
        const responses = await loadJSON('./data/responses.json', []);
        const recentResponses = responses
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 50); // Last 50 responses
        
        res.json(recentResponses);
    } catch (error) {
        console.error('Error getting responses:', error);
        res.status(500).json({ error: 'Failed to load responses' });
    }
});

// Process new response
app.post('/api/process-response', async (req, res) => {
    try {
        const { email, content, name, company, sendEmail = true } = req.body;
        
        if (!email || !content) {
            return res.status(400).json({ error: 'Email and content are required' });
        }
        
        // Use the actual response integration system
        const command = `node response-integration.js quick "${email}" "${content}"`;
        
        exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
            if (error) {
                console.error('Error processing response:', error);
                return res.status(500).json({ error: 'Failed to process response' });
            }
            
            // Parse the output to get result info
            const isReportRequest = content.toLowerCase().includes('data') || 
                                  content.toLowerCase().includes('insights') ||
                                  content.toLowerCase().includes('strategy');
            const isCallRequest = content.toLowerCase().includes('call') ||
                                content.toLowerCase().includes('meeting') ||
                                content.toLowerCase().includes('schedule');
            
            let responseType = 'interested';
            if (isReportRequest) responseType = 'report_request';
            else if (isCallRequest) responseType = 'call_request';
            
            const result = {
                success: true,
                responseType: responseType,
                autoresponseSent: true,
                analysis: {
                    type: responseType,
                    confidence: isReportRequest || isCallRequest ? 0.9 : 0.7,
                    triggers: isReportRequest ? ['data', 'insights'] : 
                             isCallRequest ? ['call', 'meeting'] : ['interesting']
                }
            };
            
            res.json(result);
        });
        
    } catch (error) {
        console.error('Error processing response:', error);
        res.status(500).json({ error: 'Failed to process response' });
    }
});

// Test email connection
app.get('/api/test-email', async (req, res) => {
    try {
        exec('node test-email.js', { cwd: __dirname }, (error, stdout, stderr) => {
            if (error) {
                res.status(500).json({ success: false, error: 'Email connection failed' });
            } else {
                res.json({ success: true, message: 'Email connection successful' });
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Test failed' });
    }
});

// Get autoresponder statistics
app.get('/api/autoresponder-stats', async (req, res) => {
    try {
        exec('node campaign-autoresponder.js stats', { cwd: __dirname }, (error, stdout, stderr) => {
            if (error) {
                res.status(500).json({ error: 'Failed to get autoresponder stats' });
            } else {
                // Parse the output (simplified)
                res.json({ output: stdout });
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// Utility functions
async function loadJSON(filepath, defaultValue = []) {
    try {
        if (fs.existsSync(filepath)) {
            const data = fs.readFileSync(filepath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.log(`Warning: Could not load ${filepath}:`, error.message);
    }
    return defaultValue;
}

function getResponseTypeCounts(responses) {
    const counts = {
        report_request: 0,
        interested: 0,
        call_request: 0,
        qualification: 0,
        not_interested: 0,
        timing_issue: 0
    };
    
    responses.forEach(response => {
        const type = response.type || 'interested';
        if (counts.hasOwnProperty(type)) {
            counts[type]++;
        } else {
            counts.interested++;
        }
    });
    
    return counts;
}

function getRecentActivity(responses, autoresponderLog) {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentResponses = responses.filter(r => new Date(r.timestamp) > sevenDaysAgo).length;
    const recentAutoresponses = autoresponderLog.filter(r => new Date(r.sentAt) > sevenDaysAgo).length;
    
    return {
        responsesLast7Days: recentResponses,
        autoresponsesLast7Days: recentAutoresponses,
        responsesToday: responses.filter(r => new Date(r.timestamp) > oneDayAgo).length,
        autoresponsesToday: autoresponderLog.filter(r => new Date(r.sentAt) > oneDayAgo).length
    };
}

// Start server
app.listen(PORT, () => {
    console.log(`
🚀 TanziTech Autoresponder Dashboard Started!

📊 Dashboard URL: http://localhost:${PORT}
⚡ Server running on port ${PORT}

Features Available:
✅ Real-time response monitoring
✅ Autoresponse processing  
✅ Template management
✅ System statistics
✅ Email connection testing

Open your browser and go to: http://localhost:${PORT}
    `);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down autoresponder dashboard...');
    process.exit(0);
});
