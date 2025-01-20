/** 
 * Type of product that can be purchased:
 * 
 * - subscription: A recurring subscription product
 * - consumable: A product that can be purchased multiple times
 * - non_consumable: A product that can only be purchased once
 * - paid subscription: A one-time payment for a subscription
 */
export type ProductType = 'subscription' | 'consumable' | 'non_consumable' | 'paid subscription';

/**
 * Represents a pricing phase for an offer
 * @remarks
 * A pricing phase defines how much and when a customer will be charged.
 * For example, a subscription might have an initial trial phase followed by a recurring payment phase.
 */
export interface PricingPhase {
    /** Price in micros (1/1,000,000 of the currency unit). For example, $1.99 = 1990000 micros */
    priceMicros: number;
    /** ISO 4217 currency code (e.g., 'USD', 'EUR', 'JPY') */
    currency: string;
    /** 
     * ISO 8601 duration string representing the billing period
     * @example
     * - 'P1M' = 1 month
     * - 'P1Y' = 1 year
     * - 'P7D' = 7 days
     */
    billingPeriod: string;
    /** 
     * Defines how the subscription recurs
     * @remarks
     * - INFINITE_RECURRING: Subscription continues until explicitly cancelled
     * - NON_RECURRING: One-time purchase that does not auto-renew
     * - FINITE_RECURRING: Subscription that renews a fixed number of times
     */
    recurrenceMode: 'INFINITE_RECURRING' | 'NON_RECURRING' | 'FINITE_RECURRING';
    /**
     * Defines when payment is collected
     * @remarks
     * - PayAsYouGo: Payment collected at the start of each billing period
     * - PayUpFront: Full payment collected at time of purchase
     */
    paymentMode: 'PayAsYouGo' | 'PayUpFront';
}

/**
 * Represents a purchase offer for a product
 * @remarks
 * An offer defines how a product can be purchased, including pricing and billing details
 */
export interface Offer {
    /** Unique identifier for the offer in the format 'platform:id' */
    id: string;
    /** Payment platform identifier (e.g., 'stripe', 'google', 'apple') */
    platform: string;
    /** Type of the offer */
    offerType: 'Subscription' | 'Default';
    /** Array of pricing phases that make up this offer's payment schedule */
    pricingPhases: PricingPhase[];
}

/**
 * Represents a product that can be purchased
 */
export interface Product {
    /** Type of the product (subscription, consumable, etc.) */
    type: ProductType;
    /** Unique identifier for the product */
    id: string;
    /** Display name of the product shown to customers */
    title: string;
    /** Optional detailed description of the product */
    description?: string;
    /** Available purchase offers for this product */
    offers: Offer[];
    /** 
     * Optional additional data associated with the product
     * @remarks
     * This can be used to store custom data needed by your application
     */
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
 * Configuration options for creating an Iaptic adapter
 * @remarks
 * Currently only supports Stripe integration, but may support other platforms in the future
 */
export interface Config {
    /** 
     * Adapter type (currently only 'stripe' is supported)
     * @remarks
     * This field determines which payment platform will be used
     */
    type: 'stripe';
    /** 
     * Stripe publishable key
     * @remarks
     * Can be found in your Stripe dashboard
     */
    stripePublicKey: string;
    /** 
     * Your application name as configured on iaptic.com
     * @remarks
     * This must match exactly what you set up in the Iaptic dashboard
     */
    appName: string;
    /** 
     * Your Iaptic public API key
     * @remarks
     * Can be found in your Iaptic dashboard under API settings
     */
    apiKey: string;
    /** 
     * Optional custom Iaptic URL for private deployments
     * @remarks
     * Only needed if you're using a self-hosted version of Iaptic
     */
    customIapticUrl?: string;
}

declare global {
    interface Window {
        /** 
         * Global IapticJS object available in browser environments
         * @remarks
         * This is automatically set when the UMD bundle is loaded via a script tag
         */
        IapticJS: {
            /** Current version of the IapticJS library */
            version: string;
            /** Function to create a new Iaptic adapter */
            createAdapter: typeof import('./index').createAdapter;
            /** Stripe adapter class */
            IapticStripe: typeof import('./iaptic-stripe').IapticStripe;
            /** Utility functions */
            Utils: typeof import('./utils').Utils;
        };
    }
}