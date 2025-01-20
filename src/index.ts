import { IapticStripe } from './iaptic-stripe';
import { Config } from './types';
import { Utils } from './utils';

export * from './iaptic-stripe';
export * from './refresh-scheduler';
export * from './utils'; 
export * from './types';

export function createAdapter(config: Config) {
    if (config.type === 'stripe') {
        return new IapticStripe(config);
    }
    throw new Error('Unsupported adapter type');
}

export const IapticJS = {
    createAdapter,
};

// Set global for browser environments
if (typeof window !== 'undefined') {
    window.IapticJS = {
        version: '1.0.3',
        createAdapter,
        IapticStripe,
        Utils
    };
}
