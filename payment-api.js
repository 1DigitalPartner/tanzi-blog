/**
 * TanziTech Payment API - Server-side Stripe Integration
 * Node.js/Express server for handling payments and subscriptions
 * 
 * Setup Instructions:
 * 1. Install dependencies: npm install stripe express cors body-parser
 * 2. Set environment variables in .env:
 *    - STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
 *    - STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
 *    - DATABASE_URL=your_database_connection_string
 * 3. Create products and prices in Stripe Dashboard
 * 4. Deploy this as a serverless function or Express app
 */

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors({
    origin: ['https://tanzitech.com', 'http://localhost:8000'], // Add your domains
    credentials: true
}));

// Raw body for webhook signature verification
app.use('/api/webhooks/stripe', bodyParser.raw({ type: 'application/json' }));

// JSON parsing for other routes
app.use(bodyParser.json());

// Database connection (replace with your preferred database)
// This example uses a simple in-memory store for demonstration
const users = new Map(); // Replace with proper database
const subscriptions = new Map(); // Replace with proper database

// Configuration
const config = {
    plans: {
        premium: {
            priceId: 'price_1234567890abcdef', // Replace with your actual Stripe price ID
            amount: 2900,
            currency: 'usd',
            interval: 'month',
            trialDays: 14
        },
        pro: {
            priceId: 'price_0987654321fedcba', // Replace with your actual Stripe price ID
            amount: 9900,
            currency: 'usd',
            interval: 'month',
            trialDays: 0
        }
    },
    domain: process.env.NODE_ENV === 'production' ? 'https://tanzitech.com' : 'http://localhost:8000'
};

/**
 * Create Checkout Session
 * POST /api/payments/create-checkout-session
 */
app.post('/api/payments/create-checkout-session', async (req, res) => {
    try {
        const { priceId, planType, customerEmail, userId, trialDays, successUrl, cancelUrl } = req.body;
        
        if (!priceId || !planType) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const plan = config.plans[planType];
        if (!plan) {
            return res.status(400).json({ error: 'Invalid plan type' });
        }

        // Create or retrieve customer
        let customer;
        if (customerEmail) {
            const existingCustomers = await stripe.customers.list({
                email: customerEmail,
                limit: 1
            });

            if (existingCustomers.data.length > 0) {
                customer = existingCustomers.data[0];
            } else {
                customer = await stripe.customers.create({
                    email: customerEmail,
                    metadata: {
                        userId: userId || ''
                    }
                });
            }
        }

        // Configure checkout session
        const sessionConfig = {
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                userId: userId || '',
                planType: planType
            }
        };

        // Add customer if available
        if (customer) {
            sessionConfig.customer = customer.id;
        } else if (customerEmail) {
            sessionConfig.customer_email = customerEmail;
        }

        // Add trial period if specified
        if (trialDays && trialDays > 0) {
            sessionConfig.subscription_data = {
                trial_period_days: trialDays,
                metadata: {
                    userId: userId || '',
                    planType: planType
                }
            };
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        res.json({ sessionId: session.id });

    } catch (error) {
        console.error('Checkout session creation error:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

/**
 * Create Customer Portal Session
 * POST /api/payments/create-portal-session
 */
app.post('/api/payments/create-portal-session', async (req, res) => {
    try {
        const { customerId, returnUrl } = req.body;

        if (!customerId) {
            return res.status(400).json({ error: 'Customer ID is required' });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl || config.domain,
        });

        res.json({ url: session.url });

    } catch (error) {
        console.error('Portal session creation error:', error);
        res.status(500).json({ error: 'Failed to create portal session' });
    }
});

/**
 * Get Subscription Status
 * GET /api/payments/subscription-status
 */
app.get('/api/payments/subscription-status', async (req, res) => {
    try {
        const userId = req.headers['user-id']; // Extract from your authentication system
        
        if (!userId) {
            return res.status(401).json({ error: 'User ID is required' });
        }

        // Get user's subscription from database
        const userSubscription = subscriptions.get(userId);
        
        if (!userSubscription) {
            return res.json({ subscription: null });
        }

        // Fetch latest subscription status from Stripe
        const subscription = await stripe.subscriptions.retrieve(userSubscription.subscriptionId);
        
        const subscriptionData = {
            id: subscription.id,
            customerId: subscription.customer,
            status: subscription.status,
            tier: userSubscription.planType,
            currentPeriodStart: subscription.current_period_start,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            trialEnd: subscription.trial_end
        };

        res.json({ subscription: subscriptionData });

    } catch (error) {
        console.error('Subscription status error:', error);
        res.status(500).json({ error: 'Failed to retrieve subscription status' });
    }
});

/**
 * Cancel Subscription
 * POST /api/payments/cancel-subscription
 */
app.post('/api/payments/cancel-subscription', async (req, res) => {
    try {
        const { subscriptionId } = req.body;
        const userId = req.headers['user-id'];

        if (!subscriptionId || !userId) {
            return res.status(400).json({ error: 'Subscription ID and User ID are required' });
        }

        // Update subscription to cancel at period end
        const subscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true
        });

        res.json({ 
            success: true, 
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            currentPeriodEnd: subscription.current_period_end
        });

    } catch (error) {
        console.error('Subscription cancellation error:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
});

/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
 */
app.post('/api/webhooks/stripe', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object);
                break;
            
            case 'customer.subscription.created':
                await handleSubscriptionCreated(event.data.object);
                break;
            
            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;
            
            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;
            
            case 'invoice.payment_succeeded':
                await handlePaymentSucceeded(event.data.object);
                break;
            
            case 'invoice.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;
            
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });

    } catch (error) {
        console.error('Webhook handler error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

/**
 * Webhook Event Handlers
 */

async function handleCheckoutCompleted(session) {
    console.log('Checkout completed:', session.id);
    
    const userId = session.metadata?.userId;
    const planType = session.metadata?.planType;
    
    if (userId && planType) {
        // Update user's subscription status in database
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        
        subscriptions.set(userId, {
            subscriptionId: subscription.id,
            customerId: session.customer,
            planType: planType,
            status: subscription.status,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Send welcome email (integrate with your email system)
        await sendWelcomeEmail(userId, planType);
        
        // Grant access to premium content
        await updateUserPermissions(userId, planType);
    }
}

async function handleSubscriptionCreated(subscription) {
    console.log('Subscription created:', subscription.id);
    
    // Additional logic for new subscription
    const customerId = subscription.customer;
    const customer = await stripe.customers.retrieve(customerId);
    
    if (customer.metadata?.userId) {
        await updateUserSubscription(customer.metadata.userId, subscription);
    }
}

async function handleSubscriptionUpdated(subscription) {
    console.log('Subscription updated:', subscription.id);
    
    // Handle subscription changes (plan changes, cancellations, etc.)
    const customerId = subscription.customer;
    const customer = await stripe.customers.retrieve(customerId);
    
    if (customer.metadata?.userId) {
        await updateUserSubscription(customer.metadata.userId, subscription);
    }
}

async function handleSubscriptionDeleted(subscription) {
    console.log('Subscription deleted:', subscription.id);
    
    // Handle subscription cancellation
    const customerId = subscription.customer;
    const customer = await stripe.customers.retrieve(customerId);
    
    if (customer.metadata?.userId) {
        await removeUserSubscription(customer.metadata.userId);
    }
}

async function handlePaymentSucceeded(invoice) {
    console.log('Payment succeeded:', invoice.id);
    
    // Handle successful recurring payment
    const customerId = invoice.customer;
    const customer = await stripe.customers.retrieve(customerId);
    
    if (customer.metadata?.userId) {
        // Send payment receipt, extend access, etc.
        await sendPaymentReceipt(customer.metadata.userId, invoice);
    }
}

async function handlePaymentFailed(invoice) {
    console.log('Payment failed:', invoice.id);
    
    // Handle failed payment
    const customerId = invoice.customer;
    const customer = await stripe.customers.retrieve(customerId);
    
    if (customer.metadata?.userId) {
        // Send dunning email, suspend access if needed
        await handleFailedPayment(customer.metadata.userId, invoice);
    }
}

/**
 * Helper Functions
 */

async function updateUserSubscription(userId, subscription) {
    const planType = getPlanTypeFromPrice(subscription.items.data[0].price.id);
    
    subscriptions.set(userId, {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        planType: planType,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date()
    });
}

async function removeUserSubscription(userId) {
    subscriptions.delete(userId);
    await updateUserPermissions(userId, 'free');
}

function getPlanTypeFromPrice(priceId) {
    for (const [planType, plan] of Object.entries(config.plans)) {
        if (plan.priceId === priceId) {
            return planType;
        }
    }
    return 'unknown';
}

async function sendWelcomeEmail(userId, planType) {
    // Integrate with your email system
    console.log(`Sending welcome email to user ${userId} for ${planType} plan`);
    
    // Example: Integrate with existing email automation
    if (global.emailAutomation) {
        await global.emailAutomation.sendWelcomeEmail(userId, planType);
    }
}

async function updateUserPermissions(userId, planType) {
    // Update user permissions in your authentication system
    console.log(`Updating permissions for user ${userId} to ${planType}`);
    
    // Example: Update user in your database
    const user = users.get(userId);
    if (user) {
        user.membershipTier = planType;
        user.updatedAt = new Date();
        users.set(userId, user);
    }
}

async function sendPaymentReceipt(userId, invoice) {
    // Send payment receipt email
    console.log(`Sending payment receipt to user ${userId} for invoice ${invoice.id}`);
}

async function handleFailedPayment(userId, invoice) {
    // Handle failed payment
    console.log(`Handling failed payment for user ${userId}, invoice ${invoice.id}`);
    
    // Send dunning email, suspend access after grace period, etc.
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server (for development)
const PORT = process.env.PORT || 3000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Payment API server running on port ${PORT}`);
    });
}

module.exports = app;
