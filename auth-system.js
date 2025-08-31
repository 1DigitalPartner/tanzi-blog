// ====================================================================
// BLOG MEMBER AUTHENTICATION SYSTEM
// User registration, login, and session management
// ====================================================================

class BlogAuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('blog_users') || '[]');
        this.currentUser = JSON.parse(localStorage.getItem('current_user') || 'null');
        this.sessions = JSON.parse(localStorage.getItem('user_sessions') || '{}');
        this.membershipTiers = this.initializeMembershipTiers();
        this.init();
    }

    // Initialize system
    init() {
        this.checkSession();
        this.setupEventListeners();
        this.updateUIForUser();
    }

    // Membership tiers configuration
    initializeMembershipTiers() {
        return {
            free: {
                name: 'Free Member',
                features: [
                    'Access to public blog posts',
                    'Basic email toolkit download',
                    'Monthly newsletter',
                    'Community forum access'
                ],
                restrictions: {
                    premiumContent: false,
                    advancedTools: false,
                    prioritySupport: false
                }
            },
            premium: {
                name: 'Premium Member',
                price: '$29/month',
                features: [
                    'All free features',
                    'Premium blog content',
                    'Advanced toolkits and templates',
                    'Exclusive case studies',
                    'Priority email support',
                    'Members-only webinars',
                    'Advanced analytics tools'
                ],
                restrictions: {
                    premiumContent: true,
                    advancedTools: true,
                    prioritySupport: true
                }
            },
            pro: {
                name: 'Pro Member',
                price: '$99/month', 
                features: [
                    'All premium features',
                    'Personal consultation sessions',
                    'Custom strategy templates',
                    'Direct access to Gabriele',
                    'Beta access to new tools',
                    'White-label resources'
                ],
                restrictions: {
                    premiumContent: true,
                    advancedTools: true,
                    prioritySupport: true,
                    personalConsultation: true
                }
            }
        };
    }

    // User registration
    async register(userData) {
        try {
            // Validate required fields
            const requiredFields = ['email', 'password', 'firstName', 'lastName'];
            for (let field of requiredFields) {
                if (!userData[field]) {
                    throw new Error(`${field} is required`);
                }
            }

            // Check if user already exists
            if (this.users.find(user => user.email === userData.email)) {
                throw new Error('User with this email already exists');
            }

            // Create new user
            const newUser = {
                id: this.generateUserId(),
                email: userData.email,
                password: await this.hashPassword(userData.password), // In production, use proper hashing
                firstName: userData.firstName,
                lastName: userData.lastName,
                company: userData.company || '',
                title: userData.title || '',
                industry: userData.industry || '',
                membershipTier: userData.membershipTier || 'free',
                registrationDate: new Date().toISOString(),
                lastLogin: null,
                isActive: true,
                preferences: {
                    newsletter: userData.newsletter || true,
                    notifications: userData.notifications || true,
                    marketingEmails: userData.marketingEmails || false
                },
                profile: {
                    bio: '',
                    avatar: '',
                    socialLinks: {},
                    interests: []
                }
            };

            // Add user to database
            this.users.push(newUser);
            this.saveUsers();

            // Log user in
            const loginResult = await this.login(userData.email, userData.password);
            
            // Trigger welcome email
            this.triggerWelcomeEmail(newUser);

            return {
                success: true,
                user: this.sanitizeUser(newUser),
                message: 'Registration successful! Welcome to the community.'
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // User login
    async login(email, password) {
        try {
            const user = this.users.find(u => u.email === email && u.isActive);
            
            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Verify password (in production, use proper verification)
            if (!await this.verifyPassword(password, user.password)) {
                throw new Error('Invalid email or password');
            }

            // Update last login
            user.lastLogin = new Date().toISOString();
            this.saveUsers();

            // Create session
            const sessionToken = this.generateSessionToken();
            this.sessions[sessionToken] = {
                userId: user.id,
                loginTime: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
            };
            this.saveSessions();

            // Set current user
            this.currentUser = this.sanitizeUser(user);
            localStorage.setItem('current_user', JSON.stringify(this.currentUser));
            localStorage.setItem('session_token', sessionToken);

            this.updateUIForUser();

            return {
                success: true,
                user: this.currentUser,
                message: 'Login successful!'
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // User logout
    logout() {
        const sessionToken = localStorage.getItem('session_token');
        if (sessionToken && this.sessions[sessionToken]) {
            delete this.sessions[sessionToken];
            this.saveSessions();
        }

        this.currentUser = null;
        localStorage.removeItem('current_user');
        localStorage.removeItem('session_token');
        
        this.updateUIForUser();
        
        return {
            success: true,
            message: 'Logged out successfully'
        };
    }

    // Check if user has access to content
    hasAccess(contentType) {
        if (!this.currentUser) return false;

        const userTier = this.membershipTiers[this.currentUser.membershipTier];
        
        switch (contentType) {
            case 'premium':
                return userTier.restrictions.premiumContent;
            case 'advanced-tools':
                return userTier.restrictions.advancedTools;
            case 'priority-support':
                return userTier.restrictions.prioritySupport;
            case 'consultation':
                return userTier.restrictions.personalConsultation;
            default:
                return true; // Public content
        }
    }

    // Update user profile
    updateProfile(profileData) {
        if (!this.currentUser) {
            return { success: false, error: 'Not logged in' };
        }

        try {
            const user = this.users.find(u => u.id === this.currentUser.id);
            if (!user) {
                throw new Error('User not found');
            }

            // Update allowed fields
            const allowedFields = ['firstName', 'lastName', 'company', 'title', 'industry', 'bio', 'interests'];
            allowedFields.forEach(field => {
                if (profileData[field] !== undefined) {
                    if (field === 'bio' || field === 'interests') {
                        user.profile[field] = profileData[field];
                    } else {
                        user[field] = profileData[field];
                    }
                }
            });

            this.saveUsers();
            this.currentUser = this.sanitizeUser(user);
            localStorage.setItem('current_user', JSON.stringify(this.currentUser));

            return {
                success: true,
                user: this.currentUser,
                message: 'Profile updated successfully'
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Check session validity
    checkSession() {
        const sessionToken = localStorage.getItem('session_token');
        if (!sessionToken || !this.sessions[sessionToken]) {
            this.logout();
            return false;
        }

        const session = this.sessions[sessionToken];
        if (new Date(session.expiresAt) < new Date()) {
            this.logout();
            return false;
        }

        return true;
    }

    // Set up event listeners
    setupEventListeners() {
        // Listen for form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'registration-form') {
                e.preventDefault();
                this.handleRegistration(e.target);
            } else if (e.target.id === 'login-form') {
                e.preventDefault();
                this.handleLogin(e.target);
            }
        });

        // Listen for logout clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('logout-btn')) {
                e.preventDefault();
                this.logout();
            }
        });
    }

    // Handle registration form submission
    async handleRegistration(form) {
        const formData = new FormData(form);
        const userData = {
            email: formData.get('email'),
            password: formData.get('password'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            company: formData.get('company'),
            title: formData.get('title'),
            industry: formData.get('industry'),
            membershipTier: formData.get('membershipTier') || 'free',
            newsletter: formData.get('newsletter') === 'on',
            notifications: formData.get('notifications') === 'on',
            marketingEmails: formData.get('marketingEmails') === 'on'
        };

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Account...';
        submitBtn.disabled = true;

        const result = await this.register(userData);

        if (result.success) {
            this.showMessage('success', result.message);
            this.hideAuthModal();
        } else {
            this.showMessage('error', result.error);
        }

        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }

    // Handle login form submission
    async handleLogin(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing In...';
        submitBtn.disabled = true;

        const result = await this.login(email, password);

        if (result.success) {
            this.showMessage('success', result.message);
            this.hideAuthModal();
        } else {
            this.showMessage('error', result.error);
        }

        // Reset button state
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }

    // Update UI based on user state
    updateUIForUser() {
        const authElements = {
            loginBtn: document.querySelectorAll('.login-btn'),
            registerBtn: document.querySelectorAll('.register-btn'),
            logoutBtn: document.querySelectorAll('.logout-btn'),
            userMenu: document.querySelectorAll('.user-menu'),
            memberContent: document.querySelectorAll('[data-member-only]'),
            premiumContent: document.querySelectorAll('[data-premium-only]'),
            userInfo: document.querySelectorAll('.user-info')
        };

        if (this.currentUser) {
            // Show logged-in state
            authElements.loginBtn.forEach(btn => btn.style.display = 'none');
            authElements.registerBtn.forEach(btn => btn.style.display = 'none');
            authElements.logoutBtn.forEach(btn => btn.style.display = 'block');
            authElements.userMenu.forEach(menu => menu.style.display = 'block');
            authElements.memberContent.forEach(content => content.style.display = 'block');

            // Update user info displays
            authElements.userInfo.forEach(info => {
                info.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
            });

            // Handle premium content
            authElements.premiumContent.forEach(content => {
                if (this.hasAccess('premium')) {
                    content.style.display = 'block';
                } else {
                    content.innerHTML = this.getPremiumUpgradeHTML();
                }
            });

        } else {
            // Show logged-out state
            authElements.loginBtn.forEach(btn => btn.style.display = 'block');
            authElements.registerBtn.forEach(btn => btn.style.display = 'block');
            authElements.logoutBtn.forEach(btn => btn.style.display = 'none');
            authElements.userMenu.forEach(menu => menu.style.display = 'none');
            authElements.memberContent.forEach(content => content.style.display = 'none');
        }
    }

    // Utility functions
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateSessionToken() {
        return btoa(Date.now() + '_' + Math.random().toString(36).substr(2, 16));
    }

    async hashPassword(password) {
        // In production, use proper hashing like bcrypt
        return btoa(password); // This is NOT secure, just for demo
    }

    async verifyPassword(password, hashedPassword) {
        // In production, use proper verification
        return btoa(password) === hashedPassword; // This is NOT secure, just for demo
    }

    sanitizeUser(user) {
        const { password, ...safeUser } = user;
        return safeUser;
    }

    saveUsers() {
        localStorage.setItem('blog_users', JSON.stringify(this.users));
    }

    saveSessions() {
        localStorage.setItem('user_sessions', JSON.stringify(this.sessions));
    }

    showMessage(type, message) {
        // Create or update message element
        let messageEl = document.getElementById('auth-message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'auth-message';
            document.body.appendChild(messageEl);
        }

        messageEl.className = `message ${type}`;
        messageEl.textContent = message;
        messageEl.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }

    hideAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    getPremiumUpgradeHTML() {
        return `
        <div class="premium-upgrade">
            <div class="upgrade-icon">🔒</div>
            <h3>Premium Content</h3>
            <p>This content is available to Premium and Pro members only.</p>
            <button class="upgrade-btn" onclick="showMembershipModal()">
                Upgrade to Premium
            </button>
        </div>
        `;
    }

    triggerWelcomeEmail(user) {
        // Add to email automation system
        const welcomeEmailData = {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            membershipTier: user.membershipTier,
            registrationDate: user.registrationDate
        };

        // Store for email system to process
        let emailQueue = JSON.parse(localStorage.getItem('email_queue') || '[]');
        emailQueue.push({
            type: 'welcome_email',
            data: welcomeEmailData,
            scheduledFor: new Date().toISOString()
        });
        localStorage.setItem('email_queue', JSON.stringify(emailQueue));
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Initiate download for registered users
    initiateDownload(resource) {
        if (!this.currentUser) {
            return { success: false, error: 'Please sign in or register to download' };
        }

        // Track the download
        this.trackResourceDownload(resource);
        
        // Generate download content based on resource type
        const downloadContent = this.generateDownloadContent(resource);
        
        // Create and trigger download
        this.triggerFileDownload(downloadContent.filename, downloadContent.content);
        
        return { success: true, message: 'Download started!' };
    }
    
    // Track resource downloads
    trackResourceDownload(resource) {
        const user = this.users.find(u => u.id === this.currentUser.id);
        if (user) {
            if (!user.downloads) user.downloads = [];
            
            user.downloads.push({
                resource: resource,
                downloadedAt: new Date().toISOString()
            });
            
            // Update engagement score
            if (!user.engagement) user.engagement = { score: 0 };
            user.engagement.score += 10;
            user.engagement.lastActivity = new Date().toISOString();
            
            this.saveUsers();
        }
    }
    
    // Generate download content based on resource type
    generateDownloadContent(resource) {
        switch (resource) {
            case 'email_toolkit':
            case 'email_validation_toolkit':
                return {
                    filename: 'TanziTech-Email-Validation-Toolkit.pdf',
                    content: this.generateEmailToolkitPDF()
                };
                
            case 'social_media_intelligence_templates':
                return {
                    filename: 'TanziTech-Social-Media-Intelligence-Templates.zip',
                    content: this.generateSocialMediaTemplatesZip()
                };
                
            case 'content_strategy_guide':
                return {
                    filename: 'TanziTech-Content-Strategy-Guide.pdf',
                    content: this.generateContentStrategyPDF()
                };
                
            default:
                return {
                    filename: 'TanziTech-Resource.pdf',
                    content: this.generateGenericResourcePDF(resource)
                };
        }
    }
    
    // Generate Email Toolkit PDF content
    generateEmailToolkitPDF() {
        return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 5 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length 500
>>
stream
BT
/F1 24 Tf
50 750 Td
(TanziTech Email Validation Toolkit) Tj
0 -50 Td
/F1 14 Tf
(Your Complete Guide to Email Marketing Success) Tj
0 -30 Td
(Downloaded by: ${this.currentUser.firstName} ${this.currentUser.lastName}) Tj
0 -50 Td
(TABLE OF CONTENTS:) Tj
0 -25 Td
(1. Email List Building Strategies) Tj
0 -20 Td
(2. Email Validation Best Practices) Tj
0 -20 Td
(3. Deliverability Optimization) Tj
0 -20 Td
(4. A/B Testing Templates) Tj
0 -20 Td
(5. Automation Workflows) Tj
0 -20 Td
(6. ROI Tracking Methods) Tj
0 -50 Td
(Visit tanzitech.com for more resources) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000074 00000 n 
0000000131 00000 n 
0000000279 00000 n 
0000000831 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
901
%%EOF`;
    }
    
    // Generate Social Media Templates ZIP (as text content)
    generateSocialMediaTemplatesZip() {
        const templates = {
            'README.txt': `TanziTech Social Media Intelligence Templates\n\nDownloaded by: ${this.currentUser.firstName} ${this.currentUser.lastName}\nDate: ${new Date().toLocaleDateString()}\n\nIncluded Templates:\n- Implementation Story Template\n- Contrarian Take Template\n- Journey Documentation Template\n- Technical Authority Framework\n- Engagement Analysis Worksheet\n\nFor support, visit: tanzitech.com`,
            'Implementation-Story-Template.md': `# Implementation Story Template\n\n## Framework:\n**Just deployed [TECHNOLOGY] in production. Here's what I learned that no tutorial teaches you...**\n\n### Structure:\n1. **The Challenge**: What problem were you solving?\n2. **The Solution**: What technology/approach did you choose?\n3. **The Reality**: What unexpected issues did you encounter?\n4. **The Lessons**: What would you do differently?\n5. **The Results**: Specific metrics and outcomes\n\n### Example:\n"Just deployed Redis caching in production. Here's what I learned that no tutorial teaches you...\n\nThe Challenge: Our API response times were hitting 2-3 seconds\nThe Solution: Implemented Redis with 24-hour cache expiry\nThe Reality: Cache invalidation became a nightmare\nThe Lessons: Start with shorter expiry times and build monitoring first\nThe Results: 85% faster response times, but 3 days of debugging"`,
            'Contrarian-Take-Template.md': `# Contrarian Take Template\n\n## Framework:\n**Everyone says [POPULAR OPINION], but after analyzing [DATA/EXPERIENCE], here's why they're wrong...**\n\n### Structure:\n1. **The Popular Opinion**: What does everyone believe?\n2. **The Evidence**: What data/experience contradicts this?\n3. **The Reality**: What's actually happening?\n4. **The Alternative**: What should people do instead?\n5. **The Proof**: Examples or data supporting your view\n\n### Example:\n"Everyone says you need 10,000 followers to be an influencer, but after analyzing 500+ micro-accounts, here's why they're wrong...\n\nPopular Opinion: More followers = more influence\nEvidence: Accounts with 1,000-5,000 followers often have higher engagement rates\nReality: Engagement quality > follower quantity\nAlternative: Focus on niche communities and authentic relationships\nProof: Case study of 3 accounts with <2K followers earning $5K+/month"`,
        };
        
        // Simple text-based representation of templates
        let zipContent = 'TanziTech Social Media Intelligence Templates Package\n\n';
        Object.keys(templates).forEach(filename => {
            zipContent += `=== ${filename} ===\n${templates[filename]}\n\n`;
        });
        
        return zipContent;
    }
    
    // Generate Content Strategy PDF
    generateContentStrategyPDF() {
        return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 5 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length 400
>>
stream
BT
/F1 24 Tf
50 750 Td
(TanziTech Content Strategy Guide) Tj
0 -50 Td
/F1 14 Tf
(Data-Driven Content That Converts) Tj
0 -30 Td
(Downloaded by: ${this.currentUser.firstName} ${this.currentUser.lastName}) Tj
0 -50 Td
(CONTENT STRATEGY FRAMEWORK:) Tj
0 -25 Td
(1. Technical Authority + Personal Journey) Tj
0 -20 Td
(2. Controversial Industry Takes) Tj
0 -20 Td
(3. Practical Implementation Stories) Tj
0 -30 Td
(Apply these 3 pillars for 85% higher engagement) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000074 00000 n 
0000000131 00000 n 
0000000279 00000 n 
0000000731 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
801
%%EOF`;
    }
    
    // Generate generic resource PDF
    generateGenericResourcePDF(resource) {
        return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 5 0 R
  >>
>>
>>
endobj

4 0 obj
<<
/Length 300
>>
stream
BT
/F1 24 Tf
50 750 Td
(TanziTech Resource) Tj
0 -50 Td
/F1 14 Tf
(${resource.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}) Tj
0 -30 Td
(Downloaded by: ${this.currentUser.firstName} ${this.currentUser.lastName}) Tj
0 -50 Td
(Thank you for downloading this resource!) Tj
0 -30 Td
(Visit tanzitech.com for more insights) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000074 00000 n 
0000000131 00000 n 
0000000279 00000 n 
0000000631 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
701
%%EOF`;
    }
    
    // Trigger file download in browser
    triggerFileDownload(filename, content) {
        const blob = new Blob([content], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        window.URL.revokeObjectURL(url);
        
        // Show success message
        this.showMessage('success', `${filename} download started!`);
    }
}

// Initialize auth system
const blogAuth = new BlogAuthSystem();

// Global functions for easy access
window.showLoginModal = function() {
    document.getElementById('auth-modal').style.display = 'block';
    document.getElementById('login-tab').click();
};

window.showRegisterModal = function() {
    document.getElementById('auth-modal').style.display = 'block';
    document.getElementById('register-tab').click();
};

window.showMembershipModal = function() {
    document.getElementById('membership-modal').style.display = 'block';
};

window.hideAuthModal = function() {
    document.getElementById('auth-modal').style.display = 'none';
};

window.hideMembershipModal = function() {
    document.getElementById('membership-modal').style.display = 'none';
};

// Tab switching for auth modal
window.showAuthTab = function(tabName) {
    const tabs = document.querySelectorAll('.auth-tab');
    const contents = document.querySelectorAll('.auth-content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.classList.remove('active'));
    
    document.getElementById(tabName + '-tab').classList.add('active');
    document.getElementById(tabName + '-content').classList.add('active');
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BlogAuthSystem };
}
