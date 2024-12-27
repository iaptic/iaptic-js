/**
 * Utility functions for the Iaptic library
 */
export class Utils {

    /**
     * Base64 encode a string
     * @param str String to encode
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
     * Get item from localStorage with type safety
     * 
     * @param key Storage key
     * @param defaultValue Default value if not found
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
     * Get item from localStorage as string
     * 
     * @param key Storage key
     */
    static storageGetString(key: string): string | null {
        const value = localStorage.getItem(key);
        return value !== null ? value : null;
    }

    /**
     * Set item in localStorage
     * 
     * @param key Storage key
     * @param value Value to store
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
     * Remove item from storage
     * 
     * @param key Storage key
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
     * Build URL with query parameters
     * @param baseUrl Base URL
     * @param params Query parameters
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
     * Format a price amount from micros
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
     * Format a ISO 8601 period in English
     * 
     * @param period ISO 8601 period
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