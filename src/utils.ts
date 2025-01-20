/**
 * Utility functions for the Iaptic library
 * @internal
 */
export class Utils {

    /**
     * Base64 encode a string with fallbacks for different environments
     * @param str - String to encode
     * @returns Base64 encoded string
     * @remarks
     * Handles non-ASCII characters and provides fallbacks for older browsers
     * and Node.js environments
     */
    static base64Encode(str: string): string {
        try {
            return btoa(str);
        } catch (e) {
            // Fallback for older browsers or non-ASCII characters
            // Use Buffer for Node.js environments
            if (typeof Buffer !== 'undefined') {
                return Buffer.from(str).toString('base64');
            }
            // Use TextEncoder for modern browsers
            if (typeof TextEncoder !== 'undefined') {
                const bytes = new TextEncoder().encode(str);
                const binString = Array.from(bytes, (x) => String.fromCodePoint(x)).join('');
                return btoa(binString);
            }
            // Basic fallback
            return btoa(encodeURIComponent(str));
        }
    }

    /**
     * Get and parse a JSON item from localStorage
     * @param key - Storage key
     * @returns Parsed value or null if not found/invalid
     * @internal
     */
    static storageGetJson<T>(key: string): T | null {
        try {
            const value = localStorage.getItem(key);
            return value !== null ? JSON.parse(value) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    }

    /**
     * Get a string item from localStorage
     * @param key - Storage key
     * @returns String value or null if not found
     * @internal
     */
    static storageGetString(key: string): string | null {
        const value = localStorage.getItem(key);
        return value !== null ? value : null;
    }

    /**
     * Store a JSON-serializable value in localStorage
     * @param key - Storage key
     * @param value - Value to store
     * @returns true if successful, false if storage failed
     * @internal
     */
    static storageSetJson(key: string, value: any): boolean {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error writing to localStorage:', e);
            return false;
        }
    }

    /**
     * Store a string value in localStorage
     * @param key - Storage key
     * @param value - String to store
     * @returns true if successful, false if storage failed
     * @internal
     */
    static storageSetString(key: string, value: string): boolean {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.error('Error writing to localStorage:', e);
            return false;
        }
    }

    /**
     * Remove an item from localStorage
     * @param key - Storage key
     * @returns true if successful, false if removal failed
     * @internal
     */
    static storageRemove(key: string): boolean {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    }

    /**
     * Build a URL with query parameters
     * @param baseUrl - Base URL without query parameters
     * @param params - Object containing query parameters
     * @returns Complete URL with encoded query parameters
     * @remarks
     * Handles URL encoding and removes undefined/null parameters
     * @internal
     */
    static buildUrl(baseUrl: string, params: Record<string, string>): string {
        try {
            // Remove trailing slash from baseUrl
            const cleanBaseUrl = baseUrl.replace(/\/$/, '');
            
            // If no params, return clean URL
            if (Object.keys(params).length === 0) {
                return cleanBaseUrl;
            }

            // Build query string
            const query = Object.entries(params)
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');

            return query ? `${cleanBaseUrl}?${query}` : cleanBaseUrl;
        } catch (e) {
            // Fallback is now the same as the main implementation
            const cleanBaseUrl = baseUrl.replace(/\/$/, '');
            
            if (Object.keys(params).length === 0) {
                return cleanBaseUrl;
            }

            const query = Object.entries(params)
                .filter(([_, value]) => value !== undefined && value !== null)
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');

            return query ? `${cleanBaseUrl}?${query}` : cleanBaseUrl;
        }
    }

    /**
     * Format a currency amount from micros with proper localization
     * @param amountMicros - Amount in micros (1/1,000,000 of currency unit)
     * @param currency - ISO 4217 currency code (e.g., 'USD', 'EUR')
     * @returns Formatted currency string
     * @example
     * ```ts
     * Utils.formatCurrency(1990000, 'USD') // Returns "$1.99"
     * Utils.formatCurrency(1000000, 'EUR') // Returns "€1"
     * ```
     */
    static formatCurrency(amountMicros: number, currency: string): string {
        if (typeof amountMicros !== 'number' || typeof currency !== 'string') {
            return '';
        }
        currency = currency.toUpperCase();

        try {
            const amount = amountMicros / 1000000;
            return new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: currency
            }).format(amount).replace('.00', '');
        } catch (error) {
            // Fallback formatting for common currencies
            const amount = amountMicros / 1000000;
            
            const currencyFormats: Record<string, { symbol: string; position: 'before' | 'after' }> = {
                USD: { symbol: '$', position: 'before' },
                EUR: { symbol: '€', position: 'before' },
                GBP: { symbol: '£', position: 'before' },
                JPY: { symbol: '¥', position: 'before' },
                CNY: { symbol: '¥', position: 'before' },
                KRW: { symbol: '₩', position: 'before' },
                INR: { symbol: '₹', position: 'before' },
                RUB: { symbol: '₽', position: 'after' },
                BRL: { symbol: 'R$', position: 'before' },
                CHF: { symbol: 'CHF', position: 'before' },
                CAD: { symbol: 'CA$', position: 'before' },
                AUD: { symbol: 'A$', position: 'before' },
                NZD: { symbol: 'NZ$', position: 'before' },
                HKD: { symbol: 'HK$', position: 'before' },
                SGD: { symbol: 'S$', position: 'before' },
                SEK: { symbol: 'kr', position: 'after' },
                NOK: { symbol: 'kr', position: 'after' },
                DKK: { symbol: 'kr', position: 'after' },
                PLN: { symbol: 'zł', position: 'after' }
            };

            const format = currencyFormats[currency];
            if (format) {
                const formattedAmount = amount.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                });
                return (format.position === 'before' 
                    ? `${format.symbol}${formattedAmount}`
                    : `${formattedAmount} ${format.symbol}`).replace('.00', '');
            }

            // Default fallback for unknown currencies
            return `${currency} ${amount.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            })}`.replace('.00', '');
        }
    }

    /**
     * Format an ISO 8601 period string into human-readable English
     * @param period - ISO 8601 duration string
     * @returns Human-readable period string
     * @example
     * ```ts
     * Utils.formatBillingPeriodEN('P1M') // Returns "Monthly"
     * Utils.formatBillingPeriodEN('P3M') // Returns "Every 3 months"
     * Utils.formatBillingPeriodEN('P1Y') // Returns "Yearly"
     * ```
     */
    static formatBillingPeriodEN(period: string): string {
        if (!period) return '';
        const match = period.match(/P(\d+)([YMWD])/);
        if (!match) return period;
        const [_, count, unit] = match;
        const displayCount = count === '1' ? '' : ' ' + count;
        switch (unit) {
            case 'Y': return count === '1' ? 'Yearly' : `Every${displayCount} years`;
            case 'M': return count === '1' ? 'Monthly' : `Every${displayCount} months`;
            case 'W': return count === '1' ? 'Weekly' : `Every${displayCount} weeks`;
            case 'D': return count === '1' ? 'Daily' : `Every${displayCount} days`;
            default: return period;
        }
    }
} 