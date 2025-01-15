# Iaptic JS

A TypeScript/JavaScript library for integrating Iaptic's payments and subscription service, using Stripe as a payment provider.

## Installation 

### NPM (recommended)
```bash
npm install --save iaptic-js
```

### CDN
Add the script directly to your HTML:
```html
<!-- UMD version (for direct browser use) -->
<script src="https://cdn.jsdelivr.net/npm/iaptic-js@1.0.1/dist/iaptic-js.js"></script>

<!-- OR: ES Module version (for modern browsers) -->
<script type="module">
  import { IapticJS } from 'https://cdn.jsdelivr.net/npm/iaptic-js@1.0.1/dist/iaptic-js.esm.js';
</script>
```

## Usage

```ts
import { IapticJS } from 'iaptic-js';

const iapticStripe = IapticJS.createAdapter({
  type: 'stripe',
  appName: 'my-app',
  apiKey: '1234567890',
  stripePublicKey: 'pk_test_1234567890',
});

const products = await iapticStripe.getProducts();
const purchases = await iapticStripe.getPurchases();

async function buy() {
  const purchase = await iapticStripe.order({
    offerId: 'stripe:prod_1234567890', // cf offers in the products array
    applicationUsername: '1234-5678-9012-3456',
    successUrl: 'https://myapp.com/order-success',
    cancelUrl: 'https://myapp.com/order-cancel',
  });
}
```

## Documentation

See the [API documentation](https://www.iaptic.com/documentation/iaptic-js) for more information.

## License

MIT