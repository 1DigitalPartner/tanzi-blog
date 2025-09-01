const { CampaignAutoresponder } = require('../campaign-autoresponder.js');
const fs = require('fs').promises;
const path = require('path');

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });
    }

    try {
        const data = req.body;
        
        // Validate required fields
        if (!data.email || !data.firstName) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email and first name are required' 
            });
        }

        console.log(`📝 New lead: ${data.email} (${data.firstName})`);

        // For now, just return success and log the lead
        // In a production setup, you'd integrate with your email system
        console.log('Lead data:', JSON.stringify(data, null, 2));

        return res.status(200).json({
            success: true,
            message: 'Report request received! Check your email within 5-10 minutes.',
            leadId: `lead_${Date.now()}`
        });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error',
            message: 'Failed to process your request. Please try again.'
        });
    }
}
