import { RefreshScheduler } from './refresh-scheduler';
import { Utils } from './utils';
import { Config, Product, Purchase, Order, PlanChange } from './types';

interface CachedProducts {
    products: Product[];
    fetchedAt: number;
}

/**
 * Response from Iaptic's /stripe/products API
 * @internal
 */
export interface GetProductsResponse {
    /** Whether the request was successful */
    ok: boolean;
    /** Array of available products */
    products: Product[];
}

/**
 * Response from Iaptic's /stripe/checkout API
 * @internal
 */
export interface PostCheckoutSessionResponse {
    /** Whether the request was successful */
    ok: boolean;
    /** Stripe Checkout URL where the customer will be redirected */
    url: string;
    /** Access token for the customer */
    accessToken: string;
}

/**
 * Response from Iaptic's /stripe/purchases API
 * @internal
 */
export interface GetPurchasesResponse {
    /** Whether the request was successful */
    ok: boolean;
    /** Array of customer's purchases */
    purchases: Purchase[];
    /** Optional new access token */
    newAccessToken?: string;
}

/**
 * Response from Iaptic's /stripe/change-plan API
 * @internal
 */
export interface ChangePlanResponse {
    /** Whether the request was successful */
    ok: boolean;
    /** Updated purchase details */
    purchase: Purchase;
    /** Optional new access token */
    newAccessToken?: string;
}

/**
 * Main class for interacting with Iaptic's Stripe integration
 * @remarks
 * This class handles all Stripe-related operations including product listing,
 * checkout sessions, and subscription management.
 */
export class IapticStripe {
    
    private readonly iapticUrl: string;
    private readonly appName: string;
    private readonly apiKey: string;
    private readonly refreshScheduler: RefreshScheduler;

    /**
     * Creates a new IapticStripe instance
     * @param config - Configuration options for the Stripe integration
     * @throws Error if required configuration is missing
     */
    constructor(config: Config) {
        if (config.type !== 'stripe') {
            throw new Error('Unsupported adapter type');
        }
        if (!config.appName || !config.apiKey) {
            throw new Error('Missing required Iaptic configuration');
        }
        
        this.iapticUrl = config.customIapticUrl?.replace(/\/$/, '') || 'https://validator.iaptic.com';
        this.appName = config.appName;
        this.apiKey = config.apiKey;
        this.refreshScheduler = new RefreshScheduler(this);
    }

    private authorizationHeader(): string {
        return `Basic ${Utils.base64Encode(`${this.appName}:${this.apiKey}`)}`;
    }

    /**
     * Gets a list of available products and their pricing
     * @returns Promise resolving to an array of products
     * @remarks
     * Results are cached locally. Use refreshProducts() to force a fresh fetch.
     */
    async getProducts(): Promise<Product[]> {
        const cached = this._getCachedProducts();
        if (cached?.products) {
            return cached.products;
        }
        return this.refreshProducts();
    }

    /**
     * Forces a refresh of the products list from the server
     * @returns Promise resolving to an array of products
     */
    async refreshProducts(): Promise<Product[]> {
        // Check if we have very recent cached data (less than 1 minute old)
        const cached = this._getCachedProducts();
        if (cached?.products && cached.fetchedAt > Date.now() - 60000) {
            return cached.products;
        }

        try {
            const response = await fetch(`${this.iapticUrl}/v3/stripe/prices`, {
                headers: {
                    Authorization: this.authorizationHeader()
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch prices from Iaptic');
            }
            
            const data = await response.json() as GetProductsResponse;
            if (!data.ok || !data.products) {
                throw new Error('Invalid response from Iaptic');
            }

            // Update cache
            this._setCachedProducts(data.products);
            return data.products;
        } catch (error) {
            console.error('Error fetching prices:', error);
            throw error;
        }
    }

    /**
     * Gets the current access token if one exists
     * @returns The current access token or undefined if none exists
     */
    getAccessToken(): string | undefined {
        return this._getStoredAccessToken();
    }

    /**
     * Creates a new order and redirects to Stripe Checkout
     * @param params - Order parameters including product and URLs
     * @throws Error if the checkout session creation fails
     * @remarks
     * This method will redirect the user to Stripe's checkout page on success
     */
    async order(params: Order): Promise<void> {
        if (!params.accessToken) {
            params.accessToken = this._getStoredAccessToken();
        }
        try {
            const response = await fetch(
                `${this.iapticUrl}/v3/stripe/checkout`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: this.authorizationHeader()
                    },
                    body: JSON.stringify(params)
                }
            );

            if (!response.ok) {
                throw new Error('Failed to create checkout session');
            }

            const data = await response.json() as PostCheckoutSessionResponse;
            if (!data.ok || !data.url) {
                throw new Error('Invalid checkout session response');
            }

            // Store session ID and access token
            if (data.accessToken) {
                this._storeAccessToken(data.accessToken);
            }

            // Redirect to Stripe Checkout
            window.location.href = data.url;
        } catch (error) {
            console.error('Error creating checkout session:', error);
            throw error;
        }
    }

    /**
     * Gets the customer's purchase history
     * @param accessToken - Optional access token (uses stored token if not provided)
     * @returns Promise resolving to an array of purchases
     * @remarks
     * This method will automatically schedule refresh operations for active subscriptions
     */
    async getPurchases(accessToken?: string): Promise<Purchase[]> {
        if (!accessToken) {
            accessToken = this._getStoredAccessToken();
        }

        if (!accessToken) {
            return [];
        }

        try {
            const response = await fetch(
                Utils.buildUrl(
                    `${this.iapticUrl}/v3/stripe/purchases`,
                    { accessToken: accessToken }
                ),
                {
                    headers: {
                        Authorization: this.authorizationHeader()
                    }
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch purchases');
            }

            const data = await response.json() as GetPurchasesResponse;
            if (!data.ok) {
                throw new Error('Invalid purchases response');
            }

            // Schedule refreshes for each purchase
            data.purchases.forEach(purchase => {
                this.refreshScheduler.schedulePurchaseRefreshes(purchase);
            });

            // Store new access token if provided
            if (data.newAccessToken) {
                this._storeAccessToken(data.newAccessToken);
            }

            return data.purchases;
        } catch (error) {
            console.error('Error fetching purchases:', error);
            throw error;
        }
    }
        
    /**
     * Redirects to Stripe Customer Portal for subscription management
     * @param params - Portal parameters including return URL
     * @throws Error if portal session creation fails
     * @remarks
     * This method will redirect the user to Stripe's customer portal on success
     */
    async redirectToCustomerPortal(params: { returnUrl?: string, accessToken?: string }) {
        if (!params.accessToken) {
            params.accessToken = this._getStoredAccessToken();
        }
        if (!params.accessToken) {
            throw new Error('No access token available');
        }
        if (!params.returnUrl) {
            params.returnUrl = window.location.href;
        }
        try {
            const response = await fetch(
                `${this.iapticUrl}/v3/stripe/portal`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: this.authorizationHeader()
                    },
                    body: JSON.stringify({ 
                        returnUrl: params.returnUrl,
                        accessToken: params.accessToken
                    })
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create portal session');
            }

            const data = await response.json();
            if (!data.ok || !data.url) {
                throw new Error('Invalid portal session response');
            }

            // Redirect to the customer portal
            window.location.href = data.url;
        } catch (error) {
            console.error('Error redirecting to customer portal:', error);
            throw error;
        }
    }

    /**
     * Changes a subscription plan
     * @param planChange - Plan change parameters
     * @returns Promise resolving to the updated purchase details
     * @remarks
     * This method handles immediate plan changes without requiring customer portal access
     */
    async changePlan(planChange: PlanChange) {
        if (!planChange.accessToken) {
            planChange.accessToken = this._getStoredAccessToken();
        }
        if (!planChange.accessToken) {
            throw new Error('No access token available');
        }

        try {
            const response = await fetch(
                `${this.iapticUrl}/v3/stripe/change-plan`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': this.authorizationHeader()
                    },
                    body: JSON.stringify(planChange)
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to change plan');
            }

            const data = await response.json() as ChangePlanResponse;
            if (!data.ok || !data.purchase) {
                throw new Error('Invalid change plan response');
            }

            // Store any new access keys
            if (data.newAccessToken) {
                this._storeAccessToken(data.newAccessToken);
            }

            // Schedule refreshes for the updated purchase
            this.refreshScheduler.schedulePurchaseRefreshes(data.purchase);

            // Also schedule an immediate refresh to catch any quick changes
            this.refreshScheduler.scheduleRefresh(
                data.purchase.purchaseId,
                new Date(Date.now() + 10000), // 10 seconds from now
                'post-change-verification'
            );

            return data.purchase;
        } catch (error) {
            console.error('Error changing plan:', error);
            throw error;
        }
    }

    //
    // Storage
    //

    /**
     * Clears all stored data including access tokens and cached products
     */
    clearStoredData() {
        Utils.storageRemove('iaptic_access_token');
        Utils.storageRemove('iaptic_products');
        this.refreshScheduler.clearSchedules();
    }

    private _storeAccessToken(accessToken: string): void {
        try {
            Utils.storageSetString('iaptic_access_token', accessToken);
        } catch (error) {
            console.error('Error storing access token:', error);
        }
    }

    private _getStoredAccessToken(): string | undefined {
        return Utils.storageGetString('iaptic_access_token') ?? undefined;
    }

    private _getCachedProducts(): CachedProducts | null {
        return Utils.storageGetJson<CachedProducts>('iaptic_products');
    }

    private _setCachedProducts(products: Product[]): void {
        Utils.storageSetJson('iaptic_products', {
            products,
            fetchedAt: Date.now()
        });
    }

} 