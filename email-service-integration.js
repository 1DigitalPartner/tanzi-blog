// ========================================================================
// EMAIL SERVICE INTEGRATION
// Simple integration with popular email marketing services
// ========================================================================

class EmailServiceIntegration {
    constructor(service, config) {
        this.service = service;
        this.config = config;
        this.apiEndpoint = this.getApiEndpoint(service);
    }

    // Get API endpoint based on service
    getApiEndpoint(service) {
        const endpoints = {
            'mailchimp': `https://${this.config.datacenter}.api.mailchimp.com/3.0`,
            'convertkit': 'https://api.convertkit.com/v3',
            'activecampaign': `${this.config.accountUrl}/api/3`,
            'mailgun': `https://api.mailgun.net/v3/${this.config.domain}`
        };
        return endpoints[service];
    }

    // Subscribe new lead to email list
    async subscribeToList(leadData, listId) {
        try {
            switch(this.service) {
                case 'mailchimp':
                    return await this.mailchimpSubscribe(leadData, listId);
                case 'convertkit':
                    return await this.convertkitSubscribe(leadData, listId);
                case 'activecampaign':
                    return await this.activecampaignSubscribe(leadData, listId);
                default:
                    throw new Error(`Service ${this.service} not supported`);
            }
        } catch (error) {
            console.error('Email subscription error:', error);
            return { success: false, error: error.message };
        }
    }

    // Mailchimp Integration
    async mailchimpSubscribe(leadData, listId) {
        const url = `${this.apiEndpoint}/lists/${listId}/members`;
        
        const subscriberData = {
            email_address: leadData.email,
            status: 'subscribed',
            merge_fields: {
                FNAME: leadData.firstName,
                LNAME: leadData.lastName || '',
                COMPANY: leadData.company || ''
            },
            tags: [
                leadData.leadMagnet || 'Blog Subscriber',
                leadData.source || 'Website'
            ]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa('anystring:' + this.config.apiKey)}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscriberData)
        });

        const result = await response.json();
        return {
            success: response.ok,
            subscriberId: result.id,
            data: result
        };
    }

    // ConvertKit Integration  
    async convertkitSubscribe(leadData, formId) {
        const url = `${this.apiEndpoint}/forms/${formId}/subscribe`;
        
        const subscriberData = {
            api_key: this.config.apiKey,
            email: leadData.email,
            first_name: leadData.firstName,
            fields: {
                company: leadData.company || '',
                lead_magnet: leadData.leadMagnet || 'Blog Subscriber',
                source: leadData.source || 'Website'
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscriberData)
        });

        const result = await response.json();
        return {
            success: response.ok,
            subscriberId: result.subscription?.id,
            data: result
        };
    }

    // ActiveCampaign Integration
    async activecampaignSubscribe(leadData, listId) {
        // First create/update contact
        const contactUrl = `${this.apiEndpoint}/contacts`;
        
        const contactData = {
            contact: {
                email: leadData.email,
                firstName: leadData.firstName,
                lastName: leadData.lastName || '',
                fieldValues: [
                    {
                        field: '1', // Assuming field 1 is company
                        value: leadData.company || ''
                    }
                ]
            }
        };

        const contactResponse = await fetch(contactUrl, {
            method: 'POST',
            headers: {
                'Api-Token': this.config.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
        });

        const contactResult = await contactResponse.json();
        
        if (contactResponse.ok) {
            // Add contact to list
            const listUrl = `${this.apiEndpoint}/contactLists`;
            const listData = {
                contactList: {
                    list: listId,
                    contact: contactResult.contact.id,
                    status: 1
                }
            };

            const listResponse = await fetch(listUrl, {
                method: 'POST',
                headers: {
                    'Api-Token': this.config.apiKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(listData)
            });

            return {
                success: listResponse.ok,
                subscriberId: contactResult.contact.id,
                data: contactResult
            };
        }

        return { success: false, error: 'Failed to create contact' };
    }

    // Send transactional email (for immediate delivery emails)
    async sendTransactionalEmail(emailData) {
        try {
            switch(this.service) {
                case 'mailgun':
                    return await this.mailgunSend(emailData);
                case 'sendgrid':
                    return await this.sendgridSend(emailData);
                default:
                    console.log('Transactional email not supported for', this.service);
                    return { success: false, error: 'Service not supported for transactional emails' };
            }
        } catch (error) {
            console.error('Transactional email error:', error);
            return { success: false, error: error.message };
        }
    }
}

// ========================================================================
// FORM UPDATE SCRIPTS
// Update your lead magnet forms to integrate with email services
// ========================================================================

// Update Email Validation Toolkit Form
function updateEmailValidationForm() {
    const form = document.getElementById('leadForm');
    const originalHandler = form.onsubmit;
    
    form.onsubmit = async function(e) {
        e.preventDefault();
        
        const formData = {
            firstName: document.getElementById('firstName').value,
            email: document.getElementById('email').value,
            company: document.getElementById('company').value,
            leadMagnet: 'Email Validation Toolkit',
            source: 'Blog',
            timestamp: new Date().toISOString()
        };

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Adding you to our list...';
        submitBtn.disabled = true;

        try {
            // Initialize your chosen email service
            const emailService = new EmailServiceIntegration('convertkit', {
                apiKey: 'YOUR_CONVERTKIT_API_KEY',
                formId: 'YOUR_FORM_ID'
            });

            // Subscribe to email list
            const result = await emailService.subscribeToList(formData, 'YOUR_FORM_ID');

            if (result.success) {
                // Store lead data locally as backup
                let leads = JSON.parse(localStorage.getItem('blog_leads') || '[]');
                leads.push({...formData, emailServiceId: result.subscriberId});
                localStorage.setItem('blog_leads', JSON.stringify(leads));

                // Redirect to thank you page
                window.location.href = './thank-you-email-toolkit.html';
            } else {
                throw new Error(result.error || 'Subscription failed');
            }
        } catch (error) {
            console.error('Email subscription failed:', error);
            
            // Fallback: store locally and show message
            let leads = JSON.parse(localStorage.getItem('blog_leads') || '[]');
            leads.push(formData);
            localStorage.setItem('blog_leads', JSON.stringify(leads));
            
            alert('Thanks! We have your info and will send your toolkit shortly. Redirecting...');
            window.location.href = './thank-you-email-toolkit.html';
        }

        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    };
}

// Update Social Media Templates Form
function updateSocialMediaForm() {
    const form = document.getElementById('socialMediaLeadForm');
    
    form.onsubmit = async function(e) {
        e.preventDefault();
        
        const formData = {
            firstName: document.getElementById('firstName').value,
            email: document.getElementById('email').value,
            role: document.getElementById('role').value,
            leadMagnet: 'Social Media Intelligence Templates',
            source: 'Blog',
            timestamp: new Date().toISOString()
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Adding you to our list...';
        submitBtn.disabled = true;

        try {
            const emailService = new EmailServiceIntegration('convertkit', {
                apiKey: 'YOUR_CONVERTKIT_API_KEY',
                formId: 'YOUR_SOCIAL_MEDIA_FORM_ID'
            });

            const result = await emailService.subscribeToList(formData, 'YOUR_SOCIAL_MEDIA_FORM_ID');

            if (result.success) {
                let leads = JSON.parse(localStorage.getItem('blog_leads') || '[]');
                leads.push({...formData, emailServiceId: result.subscriberId});
                localStorage.setItem('blog_leads', JSON.stringify(leads));

                window.location.href = './thank-you-social-media-templates.html';
            } else {
                throw new Error(result.error || 'Subscription failed');
            }
        } catch (error) {
            console.error('Email subscription failed:', error);
            
            let leads = JSON.parse(localStorage.getItem('blog_leads') || '[]');
            leads.push(formData);
            localStorage.setItem('blog_leads', JSON.stringify(leads));
            
            alert('Thanks! We have your info and will send your templates shortly. Redirecting...');
            window.location.href = './thank-you-social-media-templates.html';
        }

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    };
}

// ========================================================================
// CONFIGURATION EXAMPLES
// ========================================================================

// ConvertKit Configuration
const convertkitConfig = {
    service: 'convertkit',
    config: {
        apiKey: 'YOUR_CONVERTKIT_API_KEY',
        // Form IDs for different lead magnets
        forms: {
            emailValidation: 'YOUR_EMAIL_VALIDATION_FORM_ID',
            socialMedia: 'YOUR_SOCIAL_MEDIA_FORM_ID',
            general: 'YOUR_GENERAL_BLOG_FORM_ID'
        }
    }
};

// Mailchimp Configuration
const mailchimpConfig = {
    service: 'mailchimp',
    config: {
        apiKey: 'YOUR_MAILCHIMP_API_KEY',
        datacenter: 'us1', // Extract from your API key (after the dash)
        // List IDs for different audiences
        lists: {
            emailValidation: 'YOUR_EMAIL_VALIDATION_LIST_ID',
            socialMedia: 'YOUR_SOCIAL_MEDIA_LIST_ID',
            general: 'YOUR_GENERAL_BLOG_LIST_ID'
        }
    }
};

// ActiveCampaign Configuration
const activecampaignConfig = {
    service: 'activecampaign',
    config: {
        apiKey: 'YOUR_ACTIVECAMPAIGN_API_KEY',
        accountUrl: 'https://YOUR_ACCOUNT.api-us1.com',
        lists: {
            emailValidation: 1, // List ID numbers
            socialMedia: 2,
            general: 3
        }
    }
};

// ========================================================================
// INITIALIZATION
// Call these when your pages load
// ========================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Update forms on respective pages
    if (document.getElementById('leadForm')) {
        updateEmailValidationForm();
    }
    
    if (document.getElementById('socialMediaLeadForm')) {
        updateSocialMediaForm();
    }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EmailServiceIntegration,
        updateEmailValidationForm,
        updateSocialMediaForm
    };
}
