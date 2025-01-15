/** 
 * Type of product that can be purchased
 * - subscription: A recurring subscription product
 * - consumable: A product that can be purchased multiple times
 * - non_consumable: A product that can only be purchased once
 * - paid subscription: A one-time payment for a subscription
 */
export type ProductType = 'subscription' | 'consumable' | 'non_consumable' | 'paid subscription';

/**
 * Represents a pricing phase for an offer
 */
export interface PricingPhase {
    /** Price in micros (1/1,000,000 of the currency unit) */
    priceMicros: number;
    /** Currency code (e.g., 'USD', 'EUR') */
    currency: string;
    /** ISO 8601 duration (e.g., 'P1M' for 1 month) */
    billingPeriod: string;
    /** 
     * How the subscription recurs:
     * - INFINITE_RECURRING: Subscription continues until cancelled
     * - NON_RECURRING: One-time purchase
     * - FINITE_RECURRING: Subscription ends after a set number of periods
     */
    recurrenceMode: 'INFINITE_RECURRING' | 'NON_RECURRING' | 'FINITE_RECURRING';
    /**
     * When payment is collected:
     * - PayAsYouGo: Payment collected at the start of each period
     * - PayUpFront: Full payment collected at purchase
     */
    paymentMode: 'PayAsYouGo' | 'PayUpFront';
}

/**
 * Represents a purchase offer for a product
 */
export interface Offer {
    /** Unique identifier for the offer */
    id: string;
    /** Platform identifier (e.g., 'stripe', 'google', 'apple') */
    platform: string;
    /** Type of offer */
    offerType: 'Subscription' | 'Default';
    /** Array of pricing phases that make up this offer */
    pricingPhases: PricingPhase[];
}

/**
 * Represents a product that can be purchased
 */
export interface Product {
    /** Type of the product */
    type: ProductType;
    /** Unique identifier for the product */
    id: string;
    /** Display name of the product */
    title: string;
    /** Optional product description */
    description?: string;
    /** Array of purchase offers for this product */
    offers: Offer[];
    /** Optional additional data associated with the product */
    metadata?: Record<string, any>;
    /** Optional platform identifier (e.g., 'stripe') */
    platform?: string;
}

/**
 * Represents a purchased product
 */
export interface Purchase {
    /** Unique identifier for the purchase */
    purchaseId: string;
    /** Unique identifier for the transaction */
    transactionId: string;
    /** Unique identifier for the product */
    productId: string;
    /** Platform identifier (e.g., 'stripe') */
    platform: 'stripe';
    /** Date of the purchase */
    purchaseDate: string;
    /** Date of the last renewal */
    lastRenewalDate: string;
    /** Date of the expiration */
    expirationDate: string;
    /** Intent of the renewal */
    renewalIntent: 'Renew' | 'Cancel';
    /** Whether the purchase is a trial period */
    isTrialPeriod: boolean;
    /** Price in micros (1/1,000,000 of the currency unit) */
    amountMicros: number;
    /** Currency code (e.g., 'USD', 'EUR') */
    currency: string;
}

/**
 * Represents an order for a product
 */
export interface Order {
    /** Unique identifier for the offer */
    offerId: string;
    /** Username in the application */
    applicationUsername: string;
    /** URL to redirect to on success */
    successUrl: string;
    /** URL to redirect to on cancel */
    cancelUrl: string;
    /** Optional access token for the user */
    accessToken?: string;
}

/** Plan change request */
export interface PlanChange {
    /** Unique identifier for the purchase to replace (optional, if not provided, the best suited subscription will be used) */
    purchaseId: string;
    /** New offer to subscribe to */
    offerId: string;
    /** Optional access token for the user */
    accessToken?: string;
}

/**
 * Configuration for the IapticStripe class
 */
export interface Config {
    /** Adapter type (only stripe is supported for now) */
    type: 'stripe';
    /** Stripe public key */
    stripePublicKey: string;
    /** Name of the app on iaptic.com */
    appName: string;
    /** Public API key for the app */
    apiKey: string;
    /** Optional custom Iaptic URL (for using private iaptic deployments) */
    customIapticUrl?: string;
}

declare global {
    interface Window {
        IapticJS: {
            createAdapter: typeof import('./index').createAdapter;
            IapticStripe: typeof import('./iaptic-stripe').IapticStripe;
        };
    }
}