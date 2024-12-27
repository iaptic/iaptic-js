# Iaptic JS

A TypeScript/JavaScript library for integrating Iaptic's payments and subscription service, using Stripe as a payment provider.

## Installation 

```bash
npm install --save iaptic-js

# optional typescript types
npm install --save-dev @types/iaptic-js
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