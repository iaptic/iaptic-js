import { Offer, PricingPhase, ProductType, Purchase } from '../types';

/**
 * The product types `iaptic-js` puts on `Product.type`, in the platform's canonical spelling.
 *
 * `GET /v3/stripe/prices` — the only endpoint behind `Product` — passes a merchant's
 * `product.metadata.product_type` through verbatim, cast and unvalidated
 * (`validator/src/validator/internal/stripe/models.ts:67-68`), and synthesizes a value
 * only when that metadata is absent: `'paid subscription'` for a recurring first price,
 * `'consumable'` otherwise (`:69-80`). So the endpoint can emit any of the server's seven
 * values (`types/src/api/api-types.ts:52-59`), and the library declares all seven (FOV-1408).
 *
 * Note the spelling of the non-consumable value: `'non consumable'`, with a space.
 * That is what the validators branch on
 * (`validator/src/validator/internal/apple/validator.ts:163`,
 * `validator/src/validator/internal/windows/validator.ts:34`) and what the platform's
 * own clients send (`CdvPurchase.ProductType.NON_CONSUMABLE`).
 *
 * Line references verified against `j3k0/billing@origin/v3` `540a811d`.
 */
const SERVER_PRODUCT_TYPES = [
    'application',
    'paid subscription',
    'subscription',
    'consumable',
    'non consumable',
    'product',
    'non renewing subscription',
] as const;

describe('ProductType', () => {
    it('accepts every value the server can emit, in the server spelling', () => {
        // The check is the assignment: ts-jest fails this suite if the union stops
        // accepting one of the server's spellings (FOV-1412, FOV-1408).
        const productTypes: ProductType[] = [...SERVER_PRODUCT_TYPES];
        expect(productTypes).toHaveLength(SERVER_PRODUCT_TYPES.length);
    });

    it('still accepts the deprecated non_consumable spelling until the next major', () => {
        // Kept so code written against 1.0.4 compiles (FOV-1408). The server never sends it.
        const deprecated: ProductType = 'non_consumable';
        expect(deprecated).toBe('non_consumable');
    });
});

describe('wire values and optional fields (FOV-1408)', () => {
    it('accepts the server values for paymentMode and offerType', () => {
        const modes: PricingPhase['paymentMode'][] = ['PayAsYouGo', 'UpFront', 'FreeTrial'];
        const offerTypes: Offer['offerType'][] = ['Subscription', 'Default', 'Introductory'];
        expect(modes).toHaveLength(3);
        expect(offerTypes).toHaveLength(3);
    });

    it('accepts a purchase and a pricing phase without the fields the server may omit', () => {
        // A one-time Stripe payment has no expirationDate, renewalIntent or isTrialPeriod.
        const purchase: Purchase = { purchaseId: 'p', transactionId: 't', productId: 'x', platform: 'stripe' };
        const phase: PricingPhase = { priceMicros: 0, paymentMode: 'PayAsYouGo' };
        expect(purchase.expirationDate).toBeUndefined();
        expect(phase.billingPeriod).toBeUndefined();
    });
});
