import { Stripe, loadStripe } from '@stripe/stripe-js';
import { StripeConstructor } from '@stripe/stripe-js/types/stripe-js';

// Add TextEncoder if not available (Node.js environment)
if (typeof TextEncoder === 'undefined') {
    const { TextEncoder } = require('util');
    global.TextEncoder = TextEncoder;
}

declare global {
    // Extend the Window interface instead of declaring var
    interface Window {
        Stripe?: StripeConstructor;
    }
    
    // Extend the NodeJS Global interface for our test environment
    namespace NodeJS {
        interface Global {
            Stripe: typeof loadStripe;
            fetch: jest.Mock;
        }
    }
}

// Mock window.location
Object.defineProperty(window, 'location', {
    value: {
        href: jest.fn()
    },
    writable: true
});

// Mock Stripe
(window as any).Stripe = jest.fn(() => Promise.resolve({
    // Add mock Stripe methods as needed
} as unknown as Stripe));

// Mock fetch with proper type
(global as any).fetch = jest.fn(() => 
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
    })
) as jest.Mock; 