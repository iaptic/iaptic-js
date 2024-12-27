import { IapticStripe } from '../iaptic-stripe';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: jest.fn((key: string) => store[key] || null),
        setItem: jest.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        removeItem: jest.fn((key: string) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        })
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

// Mock fetch
global.fetch = jest.fn();

describe('IapticStripe', () => {
    let iaptic: IapticStripe;
    const mockAccessToken = 'test-access-token';

    beforeEach(() => {
        iaptic = new IapticStripe({
            type: 'stripe',
            stripePublicKey: 'pk_test_123',
            appName: 'test-app',
            apiKey: 'test-key'
        });
        localStorageMock.clear();
        (global.fetch as jest.Mock).mockClear();
    });

    describe('constructor', () => {
        it('should throw if stripePublicKey is missing', () => {
            expect(() => new IapticStripe({
                type: 'stripe',
                stripePublicKey: undefined as any,
                appName: 'test',
                apiKey: 'test'
            })).toThrow('Missing required Stripe public key');
        });

        it('should throw if appName is missing', () => {
            expect(() => new IapticStripe({
                type: 'stripe',
                stripePublicKey: 'pk_test_123',
                appName: undefined as any,
                apiKey: 'test'
            })).toThrow('Missing required Iaptic configuration');
        });
    });

    describe('getProducts', () => {
        it('should return cached products if available', async () => {
            const mockProducts = [{ id: 'test', title: 'Test Product' }];
            localStorageMock.setItem('iaptic_products', JSON.stringify({
                products: mockProducts,
                fetchedAt: Date.now()
            }));

            const products = await iaptic.getProducts();
            expect(products).toEqual(mockProducts);
            expect(global.fetch).not.toHaveBeenCalled();
        });

        it('should fetch products if cache is empty', async () => {
            const mockProducts = [{ id: 'test', title: 'Test Product' }];
            (global.fetch as jest.Mock).mockImplementationOnce(() => 
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ ok: true, products: mockProducts })
                })
            );

            const products = await iaptic.getProducts();
            expect(products).toEqual(mockProducts);
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });
    });

    describe('getPurchases', () => {
        it('should return empty array if no access token available', async () => {
            const purchases = await iaptic.getPurchases();
            expect(purchases).toEqual([]);
        });

        it('should fetch purchases with access token', async () => {
            const mockPurchases = [{
                purchaseId: 'test_purchase',
                transactionId: 'test_transaction',
                productId: 'test_product',
                platform: 'stripe' as const,
                purchaseDate: '2023-01-01',
                lastRenewalDate: '2023-01-01',
                expirationDate: '2024-01-01',
                renewalIntent: 'Renew' as const,
                isTrialPeriod: false,
                amountMicros: 999000,
                currency: 'USD'
            }];

            (global.fetch as jest.Mock).mockImplementationOnce(() => 
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ 
                        ok: true, 
                        purchases: mockPurchases 
                    })
                })
            );

            const purchases = await iaptic.getPurchases(mockAccessToken);
            
            expect(purchases).toEqual(mockPurchases);
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/v3/stripe/purchases?accessToken='),
                expect.any(Object)
            );
        });

        it('should store new access token if provided in response', async () => {
            const newAccessToken = 'new-access-token';
            
            (global.fetch as jest.Mock).mockImplementationOnce(() => 
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ 
                        ok: true, 
                        purchases: [],
                        newAccessToken
                    })
                })
            );

            await iaptic.getPurchases(mockAccessToken);
            
            expect(localStorage.getItem('iaptic_access_token')).toBe(newAccessToken);
        });
    });

    describe('order', () => {
        it('should store access token from checkout response', async () => {
            const mockAccessToken = 'test_token';
            
            (global.fetch as jest.Mock).mockImplementationOnce(() => 
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ 
                        ok: true, 
                        accessToken: mockAccessToken,
                        url: 'https://checkout.stripe.com'
                    })
                })
            );

            await iaptic.order({
                offerId: 'test_offer',
                applicationUsername: 'test_user',
                successUrl: 'https://success.com',
                cancelUrl: 'https://cancel.com'
            });

            expect(localStorage.getItem('iaptic_access_token')).toBe(mockAccessToken);
        });
    });

    describe('clearStoredData', () => {
        it('should clear all stored data', () => {
            // Set some data first
            localStorage.setItem('iaptic_access_token', 'test-token');
            localStorage.setItem('iaptic_products', JSON.stringify({ products: [] }));

            iaptic.clearStoredData();

            expect(localStorage.getItem('iaptic_access_token')).toBeNull();
            expect(localStorage.getItem('iaptic_products')).toBeNull();
        });
    });
}); 