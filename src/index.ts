import { IapticStripe } from './iaptic-stripe';
import { Config } from './types';
import { Utils } from './utils';

export * from './iaptic-stripe';
export * from './refresh-scheduler';
export * from './utils'; 
export * from './types';

/**
 * Creates an Iaptic adapter for the specified payment platform
 * @param config - Configuration options for the adapter
 * @returns An initialized adapter instance
 * @throws Error if the specified adapter type is not supported
 * @example
 * ```ts
 * const iaptic = createAdapter({
 *   type: 'stripe',
 *   appName: 'my-app',
 *   apiKey: '1234567890',
 *   stripePublicKey: 'pk_test_...'
 * });
 * ```
 */
export function createAdapter(config: Config) {
    if (config.type === 'stripe') {
        return new IapticStripe(config);
    }
    throw new Error('Unsupported adapter type');
}

/**
 * Main entry point for the Iaptic library
 */
export const IapticJS = {
    /** Current version of the IapticJS library */
    version: '1.0.4',
    /** Function to create a new Iaptic adapter */
    createAdapter,
    /** Stripe adapter class */
    IapticStripe,
    /** Utility functions */
    Utils
};

// Set global for browser environments
const _iapticJS = IapticJS;
if (typeof window !== 'undefined') {
    window.IapticJS = _iapticJS;
}
