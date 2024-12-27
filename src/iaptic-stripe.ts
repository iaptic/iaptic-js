import { RefreshScheduler } from './refresh-scheduler';
import { Utils } from './utils';
import { Config, Product, Purchase, Order, PlanChange } from './types';

interface CachedProducts {
    products: Product[];
    fetchedAt: number;
}

export interface GetProductsResponse {
    ok: boolean;
    products: Product[];
}

export interface PostCheckoutSessionResponse {
    ok: boolean;
    url: string;
    accessToken: string;
}

export interface GetPurchasesResponse {
    ok: boolean;
    purchases: Purchase[];
    newAccessToken?: string;
}

export interface ChangePlanResponse {
    ok: boolean;
    purchase: Purchase;
    newAccessToken?: string;
}

export class IapticStripe {
    static readonly VERSION = '1.0.0';
    
    private readonly iapticUrl: string;
    private readonly appName: string;
    private readonly apiKey: string;
    private readonly refreshScheduler: RefreshScheduler;

    constructor(config: Config) {
        if (config.type !== 'stripe') {
            throw new Error('Unsupported adapter type');
        }
        if (!config.stripePublicKey) {
            throw new Error('Missing required Stripe public key');
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

    async getProducts(): Promise<Product[]> {
        const cached = this._getCachedProducts();
        if (cached?.products) {
            return cached.products;
        }
        return this.refreshProducts();
    }

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

    getAccessToken(): string | undefined {
        return this._getStoredAccessToken();
    }

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
     * Get purchases status.
     * 
     * By default, it will use the access token stored in the browser's localStorage. You can
     * pass an optional access token to get the purchases for a specific user.
     * 
     * @param accessToken Optional access token for the user
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
     * Changes the subscription plan
     * 
     * @param {PlanChange} planChange - Plan change request
     * 
     * @returns {Promise<Purchase>} Updated purchase details
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