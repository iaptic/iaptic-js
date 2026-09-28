import { ProductType } from '../types';

/**
 * Product types the server puts on the wire, verbatim from the billing repo's
 * `types/src/api/api-types.ts:52-59` (origin/v3).
 *
 * Note the spelling of the non-consumable value: `'non consumable'`, with a
 * space. That is what the validators branch on
 * (`validator/src/validator/internal/apple/validator.ts:163`,
 * `validator/src/validator/internal/windows/validator.ts:34`) and what the
 * platform's own clients send (`CdvPurchase.ProductType.NON_CONSUMABLE`).
 */
const SERVER_PRODUCT_TYPES = ['subscription', 'consumable', 'non consumable', 'paid subscription'] as const;

describe('ProductType', () => {
    it('admits every product type the server emits', () => {
        // The check is the assignment: ts-jest fails this suite if the union
        // stops accepting a value the server can send (FOV-1412).
        const productTypes: ProductType[] = [...SERVER_PRODUCT_TYPES];
        expect(productTypes).toHaveLength(SERVER_PRODUCT_TYPES.length);
    });

    it('rejects the invented non_consumable spelling', () => {
        // @ts-expect-error 'non_consumable' is not a value the server ever emits (FOV-1412)
        const invented: ProductType = 'non_consumable';
        expect(invented).toBe('non_consumable');
    });
});
