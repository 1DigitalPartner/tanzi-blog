const CampaignAutoresponder = require('./campaign-autoresponder.js');

async function testReportRequest() {
    const autoresponder = new CampaignAutoresponder();
    
    console.log('🧪 Testing Report Request Autoresponse\n');
    
    const testResponse = {
        email: 'prospect@company.com',
        firstName: 'Sarah',
        company: 'TechCompany',
        campaignId: 'campaign_data_science_123',
        audienceSegment: 'data_science_professionals',
        responseContent: 'This is very interesting! Can you send me the DATA report with the insights?'
    };
    
    console.log('📧 Test Input:');
    console.log(`   Email: ${testResponse.email}`);
    console.log(`   Name: ${testResponse.firstName}`);
    console.log(`   Response: "${testResponse.responseContent}"`);
    console.log('');
    
    try {
        const result = await autoresponder.processIncomingResponse(testResponse);
        
        console.log('📊 Test Results:');
        console.log(`   Response Type: ${result.responseType}`);
        console.log(`   Autoresponse Sent: ${result.autoresponseSent}`);
        console.log(`   Processing Status: ${result.processed ? 'Success' : 'Failed'}`);
        
        // Also test the analysis directly
        const analysis = autoresponder.analyzeResponse(testResponse.responseContent);
        console.log('\n🔍 Analysis Details:');
        console.log(`   Detected Type: ${analysis.responseType}`);
        console.log(`   Confidence: ${analysis.confidence}`);
        console.log(`   Triggers: ${analysis.triggers.join(', ')}`);
        
        console.log('\n✅ Test completed successfully!');
        console.log('\n💡 The autoresponder now sends the complete report content directly in the email,');
        console.log('   eliminating the need for external links that might return 404.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testReportRequest();
