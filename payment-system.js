/**
 * TanziTech Payment System - Stripe Integration
 * Handles subscriptions, payments, and membership tier management
 */

class PaymentSystem {
    constructor() {
        // Initialize Stripe (you'll need to replace with your publishable key)
        this.stripe = null;
        this.stripePublicKey = 'pk_test_your_stripe_publishable_key_here'; // Replace with your actual key
        this.config = {
            apiEndpoint: '/api/payments',
            webhookEndpoint: '/api/webhooks/stripe',
            plans: {
                premium: {
                    priceId: 'price_premium_monthly', // Replace with your Stripe price ID
                    amount: 2900, // $29.00 in cents
                    currency: 'usd',
                    interval: 'month',
                    trialDays: 14,
                    features: [
                        'Premium blog content & case studies',
                        'Advanced toolkits & templates',
                        'Social Media Intelligence Templates',
                        'Priority email support',
                        'Members-only monthly webinars',
                        'Advanced analytics tools',
                        'Exclusive industry reports'
                    ]
                },
                pro: {
                    priceId: 'price_pro_monthly', // Replace with your Stripe price ID
                    amount: 9900, // $99.00 in cents
                    currency: 'usd',
                    interval: 'month',
                    trialDays: 0, // No trial for Pro, but includes consultation call
                    features: [
                        'Everything in Premium',
                        'Monthly 1-on-1 consultation (60min)',
                        'Custom strategy templates',
                        'Direct access to Gabriele via Slack',
                        'Beta access to new tools',
                        'White-label resources',
                        'Agency collaboration features',
                        'Custom automation setups'
                    ]
                }
            }
        };
        this.currentUser = null;
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            // Load Stripe.js
            if (!window.Stripe) {
                await this.loadStripeJS();
            }
            
            this.stripe = Stripe(this.stripePublicKey);
            this.isInitialized = true;
            console.log('Payment system initialized successfully');
            
            // Initialize user subscription status
            if (window.blogAuth && window.blogAuth.isLoggedIn()) {
                this.currentUser = window.blogAuth.getCurrentUser();
                await this.checkSubscriptionStatus();
            }
            
        } catch (error) {
            console.error('Failed to initialize payment system:', error);
        }
    }

    loadStripeJS() {
        return new Promise((resolve, reject) => {
            if (document.querySelector('script[src*="js.stripe.com"]')) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async checkSubscriptionStatus() {
        if (!this.currentUser) return;
        
        try {
            const response = await fetch(`${this.config.apiEndpoint}/subscription-status`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.currentUser.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.currentUser.subscription = data.subscription;
                this.updateUIForSubscription(data.subscription);
            }
        } catch (error) {
            console.error('Error checking subscription status:', error);
        }
    }

    async createCheckoutSession(planType, userEmail = null) {
        if (!this.isInitialized) {
            throw new Error('Payment system not initialized');
        }

        const plan = this.config.plans[planType];
        if (!plan) {
            throw new Error('Invalid plan type');
        }

        try {
            // Show loading state
            this.showPaymentLoading(true);

            const response = await fetch(`${this.config.apiEndpoint}/create-checkout-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': this.currentUser ? `Bearer ${this.currentUser.token}` : undefined
                },
                body: JSON.stringify({
                    priceId: plan.priceId,
                    planType: planType,
                    customerEmail: userEmail || (this.currentUser ? this.currentUser.email : null),
                    userId: this.currentUser ? this.currentUser.id : null,
                    trialDays: plan.trialDays,
                    successUrl: `${window.location.origin}/payment-success.html?session_id={CHECKOUT_SESSION_ID}`,
                    cancelUrl: `${window.location.origin}/payment-cancelled.html`
                })
            });

            const { sessionId } = await response.json();

            // Redirect to Stripe Checkout
            const { error } = await this.stripe.redirectToCheckout({
                sessionId: sessionId
            });

            if (error) {
                throw error;
            }

        } catch (error) {
            this.showPaymentLoading(false);
            this.showPaymentError(error.message);
            console.error('Checkout error:', error);
        }
    }

    async createCustomerPortalSession() {
        if (!this.currentUser || !this.currentUser.subscription) {
            throw new Error('No active subscription found');
        }

        try {
            const response = await fetch(`${this.config.apiEndpoint}/create-portal-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser.token}`
                },
                body: JSON.stringify({
                    customerId: this.currentUser.subscription.customerId,
                    returnUrl: window.location.origin
                })
            });

            const { url } = await response.json();
            window.location.href = url;

        } catch (error) {
            console.error('Portal session error:', error);
            this.showPaymentError('Unable to open billing portal. Please try again.');
        }
    }

    updateUIForSubscription(subscription) {
        // Update authentication navigation
        if (window.blogAuth) {
            window.blogAuth.updateSubscriptionUI(subscription);
        }

        // Show/hide premium content based on subscription
        this.togglePremiumContent(subscription);

        // Update membership modal
        this.updateMembershipModal(subscription);
    }

    togglePremiumContent(subscription) {
        const premiumElements = document.querySelectorAll('[data-premium-only]');
        const proElements = document.querySelectorAll('[data-pro-only]');
        const memberElements = document.querySelectorAll('[data-member-only]');

        // Show member benefits for any paid subscription
        if (subscription && subscription.status === 'active') {
            memberElements.forEach(el => el.style.display = 'block');
        }

        // Show premium content for premium or pro subscribers
        if (subscription && subscription.status === 'active' && 
            (subscription.tier === 'premium' || subscription.tier === 'pro')) {
            premiumElements.forEach(el => el.style.display = 'block');
        }

        // Show pro content only for pro subscribers
        if (subscription && subscription.status === 'active' && subscription.tier === 'pro') {
            proElements.forEach(el => el.style.display = 'block');
        }
    }

    updateMembershipModal(subscription) {
        const modal = document.getElementById('membership-modal');
        if (!modal) return;

        // Add current subscription indicator
        const pricingCards = modal.querySelectorAll('.pricing-card');
        pricingCards.forEach(card => {
            card.classList.remove('current-plan');
            const button = card.querySelector('button');
            
            if (subscription && subscription.status === 'active') {
                if (card.classList.contains('featured') && subscription.tier === 'premium') {
                    card.classList.add('current-plan');
                    button.textContent = 'Current Plan';
                    button.disabled = true;
                } else if (!card.classList.contains('featured') && 
                          card.querySelector('h3').textContent.includes('Pro') && 
                          subscription.tier === 'pro') {
                    card.classList.add('current-plan');
                    button.textContent = 'Current Plan';
                    button.disabled = true;
                } else if (subscription.tier === 'premium' && 
                          card.querySelector('h3').textContent.includes('Pro')) {
                    button.textContent = 'Upgrade to Pro';
                } else if (subscription.tier === 'pro' && 
                          card.classList.contains('featured')) {
                    button.textContent = 'Downgrade';
                }
            }
        });
    }

    showPaymentLoading(show) {
        let loader = document.getElementById('payment-loader');
        
        if (show && !loader) {
            loader = document.createElement('div');
            loader.id = 'payment-loader';
            loader.innerHTML = `
                <div class="payment-overlay">
                    <div class="payment-spinner">
                        <div class="spinner"></div>
                        <p>Redirecting to secure checkout...</p>
                    </div>
                </div>
            `;
            document.body.appendChild(loader);
        } else if (!show && loader) {
            loader.remove();
        }
    }

    showPaymentError(message) {
        // Show error modal or notification
        if (window.blogAuth && window.blogAuth.showMessage) {
            window.blogAuth.showMessage('error', message);
        } else {
            alert(`Payment Error: ${message}`);
        }
    }

    showPaymentSuccess(message) {
        // Show success modal or notification  
        if (window.blogAuth && window.blogAuth.showMessage) {
            window.blogAuth.showMessage('success', message);
        } else {
            alert(`Payment Success: ${message}`);
        }
    }

    // Handle membership selection from modal
    async selectMembership(planType) {
        if (!this.isInitialized) {
            await this.init();
        }

        if (planType === 'free') {
            // Close modal for free tier
            if (window.hideMembershipModal) {
                window.hideMembershipModal();
            }
            return;
        }

        // For paid plans, start checkout process
        try {
            await this.createCheckoutSession(planType);
        } catch (error) {
            console.error('Membership selection error:', error);
        }
    }

    // Webhook handlers (for server-side implementation)
    static webhookHandlers = {
        'checkout.session.completed': (event) => {
            // Handle successful subscription creation
            console.log('Checkout session completed:', event.data.object);
        },
        'customer.subscription.created': (event) => {
            // Handle new subscription
            console.log('New subscription created:', event.data.object);
        },
        'customer.subscription.updated': (event) => {
            // Handle subscription updates
            console.log('Subscription updated:', event.data.object);
        },
        'customer.subscription.deleted': (event) => {
            // Handle subscription cancellation
            console.log('Subscription cancelled:', event.data.object);
        },
        'invoice.payment_succeeded': (event) => {
            // Handle successful payment
            console.log('Payment succeeded:', event.data.object);
        },
        'invoice.payment_failed': (event) => {
            // Handle failed payment
            console.log('Payment failed:', event.data.object);
        }
    };
}

// Initialize global payment system
window.paymentSystem = new PaymentSystem();

// Global function for membership selection (called from HTML)
window.selectMembership = function(planType) {
    if (window.paymentSystem) {
        window.paymentSystem.selectMembership(planType);
    }
};

// Global function to open billing portal
window.manageBilling = function() {
    if (window.paymentSystem) {
        window.paymentSystem.createCustomerPortalSession();
    }
};

// CSS for payment loading and styling
const paymentCSS = `
.payment-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.payment-spinner {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    text-align: center;
    max-width: 300px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.current-plan {
    border: 2px solid #10b981 !important;
    position: relative;
}

.current-plan::after {
    content: 'Current Plan';
    position: absolute;
    top: -10px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
}

.pricing-card button:disabled {
    background: #e5e7eb !important;
    color: #6b7280 !important;
    cursor: not-allowed !important;
}
`;

// Inject payment CSS
const style = document.createElement('style');
style.textContent = paymentCSS;
document.head.appendChild(style);

console.log('Payment system loaded successfully');
