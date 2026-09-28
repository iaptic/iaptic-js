# Iaptic JS

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A modern TypeScript/JavaScript library for seamless integration with Iaptic's payment and subscription services, powered by Stripe. Handle one-time purchases, subscriptions, and payment management with developer-friendly APIs.

## Installation 

### NPM (recommended)
```bash
npm install --save iaptic-js
```

### CDN
```html
<!-- UMD version (for direct browser use) -->
<script src="https://cdn.jsdelivr.net/npm/iaptic-js@1.0.4/dist/iaptic-js.js"></script>

<!-- ES Module version (for modern browsers) -->
<script type="module">
  import { IapticJS } from 'https://cdn.jsdelivr.net/npm/iaptic-js@1.0.4/dist/iaptic-js.esm.js';
</script>
```

## Features ✨
- ✅ Stripe integration out-of-the-box
- ✅ Type-safe TypeScript API
- ✅ Unified interface for payments & subscriptions
- ✅ Cross-platform support (Web, React Native, Node.js)
- ✅ Automatic purchase verification

## Quick Start 🚀
```ts
import { IapticJS } from 'iaptic-js';

// Initialize with your Stripe credentials
const iaptic = IapticJS.createAdapter({
  type: 'stripe',
  appName: 'my-app',         // Your application identifier
  apiKey: '1234567890'       // Get from Iaptic dashboard
});

// Fetch available products
const products = await iaptic.getProducts();

// Handle purchase flow
async function purchaseProduct(productId: string) {
  try {
    // order() redirects the browser to Stripe Checkout on success
    await iaptic.order({
      offerId: productId,
      applicationUsername: 'user-123',
      successUrl: window.location.href + '/success',
      cancelUrl: window.location.href + '/cancel'
    });
  } catch (error) {
    console.error('Payment failed:', error);
  }
}
```

## Documentation 📚
Explore our comprehensive guides:
- [Official Documentation](https://iaptic.com/documentation/iaptic-js)
- [API Reference](https://www.iaptic.com/documentation/api/iaptic-js)
- [Getting Started Guide](https://www.iaptic.com/documentation/first-integration)
- [Demo Project](https://github.com/iaptic/iaptic-js-demo)

## License
MIT © [Iaptic](https://www.iaptic.com)
