import { Utils } from '../utils';

describe('Utils', () => {
    describe('base64Encode', () => {
        it('should encode ASCII strings', () => {
            expect(Utils.base64Encode('hello')).toBe('aGVsbG8=');
        });

        it('should encode non-ASCII strings', () => {
            // Instead of testing exact string, test that it decodes correctly
            const encoded = Utils.base64Encode('hello 👋');
            const decoded = Buffer.from(encoded, 'base64').toString('utf8');
            expect(decoded).toBe('hello 👋');
        });
    });

    describe('storageGetJson/storageSetJson', () => {
        beforeEach(() => {
            localStorage.clear();
        });

        it('should store and retrieve values', () => {
            const testData = { test: 'value' };
            Utils.storageSetJson('test-key', testData);
            expect(Utils.storageGetJson('test-key')).toEqual(testData);
        });
    });

    describe('buildUrl', () => {
        it('should build URL with query parameters', () => {
            const url = Utils.buildUrl('https://example.com', {
                key1: 'value1',
                key2: 'value2'
            });
            expect(url).toBe('https://example.com?key1=value1&key2=value2');
        });

        it('should handle empty parameters', () => {
            const url = Utils.buildUrl('https://example.com', {});
            expect(url).toBe('https://example.com');
        });

        it('should handle trailing slash in base URL', () => {
            const url = Utils.buildUrl('https://example.com/', {
                key: 'value'
            });
            expect(url).toBe('https://example.com?key=value');
        });

        it('should encode special characters', () => {
            const url = Utils.buildUrl('https://example.com', {
                key: 'value with spaces'
            });
            expect(url).toBe('https://example.com?key=value%20with%20spaces');
        });

        it('should handle multiple special characters', () => {
            const url = Utils.buildUrl('https://example.com', {
                'key with spaces': 'value & more'
            });
            expect(url).toBe('https://example.com?key%20with%20spaces=value%20%26%20more');
        });
    });

    describe('formatBillingPeriodEN', () => {
        it('should format monthly period', () => {
            expect(Utils.formatBillingPeriodEN('P1M')).toBe('Monthly');
            expect(Utils.formatBillingPeriodEN('P3M')).toBe('Every 3 months');
        });

        it('should format yearly period', () => {
            expect(Utils.formatBillingPeriodEN('P1Y')).toBe('Yearly');
            expect(Utils.formatBillingPeriodEN('P2Y')).toBe('Every 2 years');
        });
    });
}); 