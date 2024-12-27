import { jest } from '@jest/globals';
import { loadStripe } from '@stripe/stripe-js';

declare global {
    var Stripe: typeof loadStripe;
    var fetch: jest.Mock;
} 