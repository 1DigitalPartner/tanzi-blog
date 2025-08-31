const CampaignAutoresponder = require('./campaign-autoresponder.js');

async function diagnoseEmailIssue() {
    const autoresponder = new CampaignAutoresponder();
    
    console.log('🔧 Email Issue Diagnostic Tool');
    console.log('===============================\n');
    
    console.log('📝 Please test with the EXACT response content that is causing issues:');
    console.log('   (Common issue responses that should trigger full analysis but show only Calendly)\n');
    
    // Test common problematic responses
    const problematicResponses = [
        'This looks interesting, can you send me the data?',
        'Very interesting insights. Can you share the report?',
        'I would like to see the analysis',
        'Please send me the insights report',
        'Can you share the data science report?',
        'This is fascinating, I want to learn more',
        'Interesting approach, tell me more',
        'This sounds great, let me know more',
        'DATA',
        'INSIGHTS', 
        'STRATEGY'
    ];
    
    for (const response of problematicResponses) {
        console.log(`\n🧪 Testing: "${response}"`);
        
        const analysis = autoresponder.analyzeResponse(response);
        console.log(`   Detected Type: ${analysis.responseType}`);
        console.log(`   Confidence: ${analysis.confidence}`);
        console.log(`   Triggers: ${analysis.triggers.slice(0, 3).join(', ')}${analysis.triggers.length > 3 ? '...' : ''}`);
        
        if (analysis.responseType === 'report_request') {
            console.log(`   ✅ CORRECT: Will send full analysis (${autoresponder.responseTemplates.report_request.template.length} chars)`);
        } else {
            console.log(`   ❌ ISSUE: Will send ${analysis.responseType} template instead of report_request`);
            
            // Show what would be sent instead
            const template = autoresponder.responseTemplates[analysis.responseType];
            const hasCalendly = template.template.includes('{{calendarLink}}');
            const hasFullAnalysis = template.template.includes('110-Character Formula');
            
            console.log(`       - Contains Calendly link: ${hasCalendly ? 'YES' : 'NO'}`);
            console.log(`       - Contains full analysis: ${hasFullAnalysis ? 'YES' : 'NO'}`);
            console.log(`       - Template length: ${template.template.length} characters`);
        }
    }
    
    console.log('\n🔍 SUMMARY OF FINDINGS:');
    console.log('========================');
    
    // Count issues
    let correctCount = 0;
    let issueCount = 0;
    
    for (const response of problematicResponses) {
        const analysis = autoresponder.analyzeResponse(response);
        if (analysis.responseType === 'report_request') {
            correctCount++;
        } else {
            issueCount++;
        }
    }
    
    console.log(`✅ Responses correctly detected as report_request: ${correctCount}/${problematicResponses.length}`);
    console.log(`❌ Responses incorrectly classified: ${issueCount}/${problematicResponses.length}`);
    
    console.log('\n💡 SOLUTION RECOMMENDATIONS:');
    console.log('=============================');
    
    if (issueCount > 0) {
        console.log('1. Add more trigger words to report_request patterns');
        console.log('2. Adjust priority scoring for better classification');
        console.log('3. Consider making "interested" template also include full analysis');
    } else {
        console.log('✅ Classification is working correctly!');
        console.log('   The issue might be:');
        console.log('   1. Email client not displaying HTML properly');
        console.log('   2. Email content being truncated by email provider');
        console.log('   3. Actual responses containing different words than tested');
    }
    
    console.log('\n🧪 TO TEST WITH YOUR SPECIFIC EMAIL RESPONSE:');
    console.log('==============================================');
    console.log('1. Copy the exact text from the prospect response');
    console.log('2. Run: node test-email-content.js');
    console.log('3. Or use the dashboard at http://localhost:8080/dashboard.html');
    
    console.log('\n📧 TO CHECK THE ACTUAL EMAIL CONTENT BEING SENT:');
    console.log('===============================================');
    console.log('1. Check the autoresponse-log.json file for recent sends');
    console.log('2. Look at the email HTML in your email client View Source option');
    console.log('3. Test with a different email client (Gmail web vs. mobile vs. Outlook)');
}

diagnoseEmailIssue().catch(console.error);
