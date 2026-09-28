import { ProductType } from '../types';

/**
 * The product types this library can put on `Product.type`.
 *
 * `GET /v3/stripe/prices` — the only endpoint behind `Product` — returns Stripe's
 * `product.metadata.product_type` cast verbatim
 * (`validator/src/validator/internal/stripe/models.ts:67-68`) and otherwise
 * synthesizes only `'paid subscription'` and `'consumable'`, so these four are the
 * reachable set. The server's own union is wider — `'application'`, `'product'` and
 * `'non renewing subscription'` can only arrive through free-form merchant metadata
 * (`types/src/api/api-types.ts:52-59`); widening this union accordingly is FOV-1408's
 * call, not this test's.
 *
 * Note the spelling of the non-consumable value: `'non consumable'`, with a space.
 * That is what the validators branch on
 * (`validator/src/validator/internal/apple/validator.ts:163`,
 * `validator/src/validator/internal/windows/validator.ts:34`) and what the platform's
 * own clients send (`CdvPurchase.ProductType.NON_CONSUMABLE`).
 *
 * Line references verified against `j3k0/billing@origin/v3` `e62b7598`.
 */
const REACHABLE_PRODUCT_TYPES = ['subscription', 'consumable', 'non consumable', 'paid subscription'] as const;

describe('ProductType', () => {
    it('admits every product type this endpoint can emit', () => {
        // The check is the assignment: ts-jest fails this suite if the union
        // stops accepting a value the server can send (FOV-1412).
        const productTypes: ProductType[] = [...REACHABLE_PRODUCT_TYPES];
        expect(productTypes).toHaveLength(REACHABLE_PRODUCT_TYPES.length);
    });

    it('rejects the invented non_consumable spelling', () => {
        // @ts-expect-error 'non_consumable' is not a value the server ever emits (FOV-1412)
        const invented: ProductType = 'non_consumable';
        expect(invented).toBe('non_consumable');
    });
});
