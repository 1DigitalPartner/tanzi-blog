const CampaignAutoresponder = require('./campaign-autoresponder.js');

async function testEmailContent() {
    const autoresponder = new CampaignAutoresponder();
    
    console.log('🧪 Testing Email Content Generation\n');
    
    // Test various response types
    const testCases = [
        {
            name: 'DATA Request',
            responseContent: 'Can you send me the DATA report? This looks very interesting.',
            expected: 'report_request'
        },
        {
            name: 'INSIGHTS Request', 
            responseContent: 'I would love to see the INSIGHTS analysis you mentioned.',
            expected: 'report_request'
        },
        {
            name: 'Call Request',
            responseContent: 'Can we schedule a CALL to discuss this further?',
            expected: 'call_request'
        },
        {
            name: 'General Interest',
            responseContent: 'This looks interesting, tell me more about your approach.',
            expected: 'interested'
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`🔍 Testing: ${testCase.name}`);
        console.log(`Input: "${testCase.responseContent}"`);
        
        const testResponse = {
            email: 'test@company.com',
            firstName: 'John',
            company: 'TestCompany',
            campaignId: 'test_campaign',
            audienceSegment: 'data_science_professionals',
            responseContent: testCase.responseContent
        };
        
        // Analyze the response
        const analysis = autoresponder.analyzeResponse(testCase.responseContent);
        console.log(`Detected: ${analysis.responseType} (confidence: ${analysis.confidence})`);
        console.log(`Expected: ${testCase.expected}`);
        console.log(`Match: ${analysis.responseType === testCase.expected ? '✅' : '❌'}`);
        
        // Generate the autoresponse
        const autoresponse = autoresponder.generateAutoresponse(analysis, {
            firstName: 'John',
            company: 'TestCompany',
            email: 'test@company.com'
        }, {
            campaignId: 'test',
            audienceSegment: 'data_science_professionals'
        });
        
        console.log(`Subject: ${autoresponse.subject}`);
        console.log(`Content Length: ${autoresponse.content.length} characters`);
        
        // Check if content has the full analysis (for report_request)
        if (analysis.responseType === 'report_request') {
            const hasFullAnalysis = autoresponse.content.includes('110-Character Formula') && 
                                  autoresponse.content.includes('Question Paradox') && 
                                  autoresponse.content.includes('Strategic Data Usage') &&
                                  autoresponse.content.includes('BONUS INSIGHTS');
            console.log(`Contains Full Analysis: ${hasFullAnalysis ? '✅' : '❌'}`);
            
            if (!hasFullAnalysis) {
                console.log('⚠️  ISSUE: Report request template missing complete analysis content!');
            }
        }
        
        // Check for Calendly links in non-call requests
        const hasCalendlyLink = autoresponse.content.includes('calendly.com');
        if (analysis.responseType !== 'call_request' && hasCalendlyLink) {
            console.log('⚠️  WARNING: Non-call response contains Calendly link');
        }
        
        console.log('─'.repeat(50));
    }
    
    // Test the specific issue you mentioned
    console.log('\n🎯 SPECIFIC ISSUE TEST:');
    console.log('Testing response that should get full analysis but only shows Calendly...\n');
    
    const problemResponse = {
        email: 'prospect@real-company.com',
        firstName: 'Sarah',
        responseContent: 'This is very interesting! Can you send me the full DATA analysis report?'
    };
    
    const analysis = autoresponder.analyzeResponse(problemResponse.responseContent);
    console.log(`Response Type Detected: ${analysis.responseType}`);
    console.log(`Triggers Found: ${analysis.triggers.join(', ')}`);
    
    const autoresponse = autoresponder.generateAutoresponse(analysis, problemResponse, {
        campaignId: 'real_campaign',
        audienceSegment: 'data_science_professionals'
    });
    
    console.log(`\nEmail Subject: ${autoresponse.subject}`);
    console.log(`\nFirst 200 chars of content:`);
    console.log(autoresponse.content.substring(0, 200) + '...');
    
    console.log(`\nFull content preview (showing key sections):`);
    const lines = autoresponse.content.split('\n');
    lines.forEach((line, i) => {
        if (line.includes('KEY FINDINGS') || 
            line.includes('110-Character') ||
            line.includes('Question Paradox') ||
            line.includes('BONUS INSIGHTS') ||
            line.includes('calendly')) {
            console.log(`Line ${i}: ${line}`);
        }
    });
}

testEmailContent().catch(console.error);
