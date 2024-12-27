import { IapticStripe } from './iaptic-stripe';
import { Config } from './types';

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

export default IapticJS;