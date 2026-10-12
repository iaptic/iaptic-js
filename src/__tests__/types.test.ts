import { ProductType } from '../types';

/**
 * The product types `iaptic-js` puts on `Product.type`, in the platform's canonical spelling.
 *
 * `GET /v3/stripe/prices` — the only endpoint behind `Product` — passes a merchant's
 * `product.metadata.product_type` through verbatim, cast and unvalidated
 * (`validator/src/validator/internal/stripe/models.ts:67-68`), and synthesizes a value
 * only when that metadata is absent: `'paid subscription'` for a recurring first price,
 * `'consumable'` otherwise (`:69-80`). So the endpoint can emit any of the server's seven
 * values (`types/src/api/api-types.ts:52-59`) — two of the four below, `'subscription'`
 * and `'non consumable'`, only ever arrive through that metadata. These four are the ones
 * the library declares; widening the union to the server's set is FOV-1408, not this test.
 *
 * Note the spelling of the non-consumable value: `'non consumable'`, with a space.
 * That is what the validators branch on
 * (`validator/src/validator/internal/apple/validator.ts:163`,
 * `validator/src/validator/internal/windows/validator.ts:34`) and what the platform's
 * own clients send (`CdvPurchase.ProductType.NON_CONSUMABLE`).
 *
 * Line references verified against `j3k0/billing@origin/v3` `540a811d`.
 */
const LIBRARY_PRODUCT_TYPES = ['subscription', 'consumable', 'non consumable', 'paid subscription'] as const;

describe('ProductType', () => {
    it('accepts the four values the library declares, in the server spelling', () => {
        // The check is the assignment: ts-jest fails this suite if the union stops
        // accepting one of the spellings the library documents (FOV-1412).
        const productTypes: ProductType[] = [...LIBRARY_PRODUCT_TYPES];
        expect(productTypes).toHaveLength(LIBRARY_PRODUCT_TYPES.length);
    });

    it('rejects the invented non_consumable spelling', () => {
        // @ts-expect-error 'non_consumable' is not a value the server ever emits (FOV-1412)
        const invented: ProductType = 'non_consumable';
        expect(invented).toBe('non_consumable');
    });
});
