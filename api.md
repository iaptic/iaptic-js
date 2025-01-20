[**iaptic-js**](README.md)

***

# iaptic-js

## Classes

### IapticStripe


Main class for interacting with Iaptic's Stripe integration

#### Remarks

This class handles all Stripe-related operations including product listing,
checkout sessions, and subscription management.

#### Constructors

##### new IapticStripe()

> **new IapticStripe**(`config`): [`IapticStripe`](globals.md#iapticstripe)


Creates a new IapticStripe instance

###### Parameters

###### config

[`Config`](globals.md#config)

Configuration options for the Stripe integration

###### Returns

[`IapticStripe`](globals.md#iapticstripe)

###### Throws

Error if required configuration is missing

#### Methods

##### changePlan()

> **changePlan**(`planChange`): `Promise`\<[`Purchase`](globals.md#purchase-1)\>


Changes a subscription plan

###### Parameters

###### planChange

[`PlanChange`](globals.md#planchange)

Plan change parameters

###### Returns

`Promise`\<[`Purchase`](globals.md#purchase-1)\>

Promise resolving to the updated purchase details

###### Remarks

This method handles immediate plan changes without requiring customer portal access

##### clearStoredData()

> **clearStoredData**(): `void`


Clears all stored data including access tokens and cached products

###### Returns

`void`

##### getAccessToken()

> **getAccessToken**(): `undefined` \| `string`


Gets the current access token if one exists

###### Returns

`undefined` \| `string`

The current access token or undefined if none exists

##### getProducts()

> **getProducts**(): `Promise`\<[`Product`](globals.md#product)[]\>


Gets a list of available products and their pricing

###### Returns

`Promise`\<[`Product`](globals.md#product)[]\>

Promise resolving to an array of products

###### Remarks

Results are cached locally. Use refreshProducts() to force a fresh fetch.

##### getPurchases()

> **getPurchases**(`accessToken`?): `Promise`\<[`Purchase`](globals.md#purchase-1)[]\>


Gets the customer's purchase history

###### Parameters

###### accessToken?

`string`

Optional access token (uses stored token if not provided)

###### Returns

`Promise`\<[`Purchase`](globals.md#purchase-1)[]\>

Promise resolving to an array of purchases

###### Remarks

This method will automatically schedule refresh operations for active subscriptions

##### order()

> **order**(`params`): `Promise`\<`void`\>


Creates a new order and redirects to Stripe Checkout

###### Parameters

###### params

[`Order`](globals.md#order-1)

Order parameters including product and URLs

###### Returns

`Promise`\<`void`\>

###### Throws

Error if the checkout session creation fails

###### Remarks

This method will redirect the user to Stripe's checkout page on success

##### redirectToCustomerPortal()

> **redirectToCustomerPortal**(`params`): `Promise`\<`void`\>


Redirects to Stripe Customer Portal for subscription management

###### Parameters

###### params

Portal parameters including return URL

###### accessToken

`string`

###### returnUrl

`string`

###### Returns

`Promise`\<`void`\>

###### Throws

Error if portal session creation fails

###### Remarks

This method will redirect the user to Stripe's customer portal on success

##### refreshProducts()

> **refreshProducts**(): `Promise`\<[`Product`](globals.md#product)[]\>


Forces a refresh of the products list from the server

###### Returns

`Promise`\<[`Product`](globals.md#product)[]\>

Promise resolving to an array of products

***

### RefreshScheduler


#### Constructors

##### new RefreshScheduler()

> **new RefreshScheduler**(`iapticStripe`): [`RefreshScheduler`](globals.md#refreshscheduler)


###### Parameters

###### iapticStripe

[`IapticStripe`](globals.md#iapticstripe)

###### Returns

[`RefreshScheduler`](globals.md#refreshscheduler)

#### Properties

##### schedules

> **schedules**: [`ScheduledRefresh`](globals.md#scheduledrefresh)[] = `[]`


#### Methods

##### clearSchedules()

> **clearSchedules**(): `void`


###### Returns

`void`

##### schedulePurchaseRefreshes()

> **schedulePurchaseRefreshes**(`purchase`): `void`


###### Parameters

###### purchase

[`Purchase`](globals.md#purchase-1)

###### Returns

`void`

##### scheduleRefresh()

> **scheduleRefresh**(`subscriptionId`, `date`, `reason`): `void`


###### Parameters

###### subscriptionId

`string`

###### date

`Date`

###### reason

`string`

###### Returns

`void`

***

### Utils


**`Internal`**

Utility functions for the Iaptic library

#### Constructors

##### new Utils()

> **new Utils**(): [`Utils`](globals.md#utils)

###### Returns

[`Utils`](globals.md#utils)

#### Methods

##### base64Encode()

> `static` **base64Encode**(`str`): `string`


Base64 encode a string with fallbacks for different environments

###### Parameters

###### str

`string`

String to encode

###### Returns

`string`

Base64 encoded string

###### Remarks

Handles non-ASCII characters and provides fallbacks for older browsers
and Node.js environments

##### buildUrl()

> `static` **buildUrl**(`baseUrl`, `params`): `string`


**`Internal`**

Build a URL with query parameters

###### Parameters

###### baseUrl

`string`

Base URL without query parameters

###### params

`Record`\<`string`, `string`\>

Object containing query parameters

###### Returns

`string`

Complete URL with encoded query parameters

###### Remarks

Handles URL encoding and removes undefined/null parameters

##### formatBillingPeriodEN()

> `static` **formatBillingPeriodEN**(`period`): `string`


Format an ISO 8601 period string into human-readable English

###### Parameters

###### period

`string`

ISO 8601 duration string

###### Returns

`string`

Human-readable period string

###### Example

```ts
Utils.formatBillingPeriodEN('P1M') // Returns "Monthly"
Utils.formatBillingPeriodEN('P3M') // Returns "Every 3 months"
Utils.formatBillingPeriodEN('P1Y') // Returns "Yearly"
```

##### formatCurrency()

> `static` **formatCurrency**(`amountMicros`, `currency`): `string`


Format a currency amount from micros with proper localization

###### Parameters

###### amountMicros

`number`

Amount in micros (1/1,000,000 of currency unit)

###### currency

`string`

ISO 4217 currency code (e.g., 'USD', 'EUR')

###### Returns

`string`

Formatted currency string

###### Example

```ts
Utils.formatCurrency(1990000, 'USD') // Returns "$1.99"
Utils.formatCurrency(1000000, 'EUR') // Returns "€1"
```

##### storageGetJson()

> `static` **storageGetJson**\<`T`\>(`key`): `null` \| `T`


**`Internal`**

Get and parse a JSON item from localStorage

###### Type Parameters

• **T**

###### Parameters

###### key

`string`

Storage key

###### Returns

`null` \| `T`

Parsed value or null if not found/invalid

##### storageGetString()

> `static` **storageGetString**(`key`): `null` \| `string`


**`Internal`**

Get a string item from localStorage

###### Parameters

###### key

`string`

Storage key

###### Returns

`null` \| `string`

String value or null if not found

##### storageRemove()

> `static` **storageRemove**(`key`): `boolean`


**`Internal`**

Remove an item from localStorage

###### Parameters

###### key

`string`

Storage key

###### Returns

`boolean`

true if successful, false if removal failed

##### storageSetJson()

> `static` **storageSetJson**(`key`, `value`): `boolean`


**`Internal`**

Store a JSON-serializable value in localStorage

###### Parameters

###### key

`string`

Storage key

###### value

`any`

Value to store

###### Returns

`boolean`

true if successful, false if storage failed

##### storageSetString()

> `static` **storageSetString**(`key`, `value`): `boolean`


**`Internal`**

Store a string value in localStorage

###### Parameters

###### key

`string`

Storage key

###### value

`string`

String to store

###### Returns

`boolean`

true if successful, false if storage failed

## Interfaces

### ChangePlanResponse


**`Internal`**

Response from Iaptic's /stripe/change-plan API

#### Properties

##### newAccessToken?

> `optional` **newAccessToken**: `string`


Optional new access token

##### ok

> **ok**: `boolean`


Whether the request was successful

##### purchase

> **purchase**: [`Purchase`](globals.md#purchase-1)


Updated purchase details

***

### Config


Configuration options for creating an Iaptic adapter

#### Remarks

Currently only supports Stripe integration, but may support other platforms in the future

#### Properties

##### apiKey

> **apiKey**: `string`


Your Iaptic public API key

###### Remarks

Can be found in your Iaptic dashboard under API settings

##### appName

> **appName**: `string`


Your application name as configured on iaptic.com

###### Remarks

This must match exactly what you set up in the Iaptic dashboard

##### customIapticUrl?

> `optional` **customIapticUrl**: `string`


Optional custom Iaptic URL for private deployments

###### Remarks

Only needed if you're using a self-hosted version of Iaptic

##### stripePublicKey

> **stripePublicKey**: `string`


Stripe publishable key

###### Remarks

Can be found in your Stripe dashboard

##### type

> **type**: `"stripe"`


Adapter type (currently only 'stripe' is supported)

###### Remarks

This field determines which payment platform will be used

***

### GetProductsResponse


**`Internal`**

Response from Iaptic's /stripe/products API

#### Properties

##### ok

> **ok**: `boolean`


Whether the request was successful

##### products

> **products**: [`Product`](globals.md#product)[]


Array of available products

***

### GetPurchasesResponse


**`Internal`**

Response from Iaptic's /stripe/purchases API

#### Properties

##### newAccessToken?

> `optional` **newAccessToken**: `string`


Optional new access token

##### ok

> **ok**: `boolean`


Whether the request was successful

##### purchases

> **purchases**: [`Purchase`](globals.md#purchase-1)[]


Array of customer's purchases

***

### Offer


Represents a purchase offer for a product

#### Remarks

An offer defines how a product can be purchased, including pricing and billing details

#### Properties

##### id

> **id**: `string`


Unique identifier for the offer in the format 'platform:id'

##### offerType

> **offerType**: `"Subscription"` \| `"Default"`


Type of the offer

##### platform

> **platform**: `string`


Payment platform identifier (e.g., 'stripe', 'google', 'apple')

##### pricingPhases

> **pricingPhases**: [`PricingPhase`](globals.md#pricingphase)[]


Array of pricing phases that make up this offer's payment schedule

***

### Order


Represents an order for a product

#### Properties

##### accessToken?

> `optional` **accessToken**: `string`


Optional access token for the user

##### applicationUsername

> **applicationUsername**: `string`


Username in the application

##### cancelUrl

> **cancelUrl**: `string`


URL to redirect to on cancel

##### offerId

> **offerId**: `string`


Unique identifier for the offer

##### successUrl

> **successUrl**: `string`


URL to redirect to on success

***

### PlanChange


Plan change request

#### Properties

##### accessToken?

> `optional` **accessToken**: `string`


Optional access token for the user

##### offerId

> **offerId**: `string`


New offer to subscribe to

##### purchaseId

> **purchaseId**: `string`


Unique identifier for the purchase to replace (optional, if not provided, the best suited subscription will be used)

***

### PostCheckoutSessionResponse


**`Internal`**

Response from Iaptic's /stripe/checkout API

#### Properties

##### accessToken

> **accessToken**: `string`


Access token for the customer

##### ok

> **ok**: `boolean`


Whether the request was successful

##### url

> **url**: `string`


Stripe Checkout URL where the customer will be redirected

***

### PricingPhase


Represents a pricing phase for an offer

#### Remarks

A pricing phase defines how much and when a customer will be charged.
For example, a subscription might have an initial trial phase followed by a recurring payment phase.

#### Properties

##### billingPeriod

> **billingPeriod**: `string`


ISO 8601 duration string representing the billing period

###### Example

```ts
- 'P1M' = 1 month
- 'P1Y' = 1 year
- 'P7D' = 7 days
```

##### currency

> **currency**: `string`


ISO 4217 currency code (e.g., 'USD', 'EUR', 'JPY')

##### paymentMode

> **paymentMode**: `"PayAsYouGo"` \| `"PayUpFront"`


Defines when payment is collected

###### Remarks

- PayAsYouGo: Payment collected at the start of each billing period
- PayUpFront: Full payment collected at time of purchase

##### priceMicros

> **priceMicros**: `number`


Price in micros (1/1,000,000 of the currency unit). For example, $1.99 = 1990000 micros

##### recurrenceMode

> **recurrenceMode**: `"INFINITE_RECURRING"` \| `"NON_RECURRING"` \| `"FINITE_RECURRING"`


Defines how the subscription recurs

###### Remarks

- INFINITE_RECURRING: Subscription continues until explicitly cancelled
- NON_RECURRING: One-time purchase that does not auto-renew
- FINITE_RECURRING: Subscription that renews a fixed number of times

***

### Product


Represents a product that can be purchased

#### Properties

##### description?

> `optional` **description**: `string`


Optional detailed description of the product

##### id

> **id**: `string`


Unique identifier for the product

##### metadata?

> `optional` **metadata**: `Record`\<`string`, `any`\>


Optional additional data associated with the product

###### Remarks

This can be used to store custom data needed by your application

##### offers

> **offers**: [`Offer`](globals.md#offer)[]


Available purchase offers for this product

##### platform?

> `optional` **platform**: `string`


Optional platform identifier (e.g., 'stripe')

##### title

> **title**: `string`


Display name of the product shown to customers

##### type

> **type**: [`ProductType`](globals.md#producttype)


Type of the product (subscription, consumable, etc.)

***

### Purchase


Represents a purchased product

#### Properties

##### amountMicros

> **amountMicros**: `number`


Price in micros (1/1,000,000 of the currency unit)

##### currency

> **currency**: `string`


Currency code (e.g., 'USD', 'EUR')

##### expirationDate

> **expirationDate**: `string`


Date of the expiration

##### isTrialPeriod

> **isTrialPeriod**: `boolean`


Whether the purchase is a trial period

##### lastRenewalDate

> **lastRenewalDate**: `string`


Date of the last renewal

##### platform

> **platform**: `"stripe"`


Platform identifier (e.g., 'stripe')

##### productId

> **productId**: `string`


Unique identifier for the product

##### purchaseDate

> **purchaseDate**: `string`


Date of the purchase

##### purchaseId

> **purchaseId**: `string`


Unique identifier for the purchase

##### renewalIntent

> **renewalIntent**: `"Renew"` \| `"Cancel"`


Intent of the renewal

##### transactionId

> **transactionId**: `string`


Unique identifier for the transaction

***

### ScheduledRefresh


Represents a scheduled refresh for a subscription

#### Properties

##### completed

> **completed**: `boolean`


Whether the refresh has been completed

##### id

> **id**: `string`


Unique identifier for the scheduled refresh

##### inProgress

> **inProgress**: `boolean`


Whether the refresh is currently in progress

##### reason

> **reason**: `string`


Reason for the scheduled refresh

##### scheduledAt

> **scheduledAt**: `number`


Date and time of the scheduled refresh

##### subscriptionId

> **subscriptionId**: `string`


Unique identifier for the subscription

## Type Aliases

### ProductType

> **ProductType**: `"subscription"` \| `"consumable"` \| `"non_consumable"` \| `"paid subscription"`


Type of product that can be purchased:

- subscription: A recurring subscription product
- consumable: A product that can be purchased multiple times
- non_consumable: A product that can only be purchased once
- paid subscription: A one-time payment for a subscription

## Variables

### IapticJS

> `const` **IapticJS**: `object`


Main entry point for the Iaptic library

#### Type declaration

##### createAdapter()

> **createAdapter**: (`config`) => [`IapticStripe`](globals.md#iapticstripe)

Function to create a new Iaptic adapter

Creates an Iaptic adapter for the specified payment platform

###### Parameters

###### config

[`Config`](globals.md#config)

Configuration options for the adapter

###### Returns

[`IapticStripe`](globals.md#iapticstripe)

An initialized adapter instance

###### Throws

Error if the specified adapter type is not supported

###### Example

```ts
const iaptic = createAdapter({
  type: 'stripe',
  appName: 'my-app',
  apiKey: '1234567890',
  stripePublicKey: 'pk_test_...'
});
```

##### IapticStripe

> **IapticStripe**: *typeof* [`IapticStripe`](globals.md#iapticstripe)

Stripe adapter class

##### Utils

> **Utils**: *typeof* [`Utils`](globals.md#utils)

Utility functions

##### version

> **version**: `string` = `'1.0.3'`

Current version of the IapticJS library

## Functions

### createAdapter()

> **createAdapter**(`config`): [`IapticStripe`](globals.md#iapticstripe)


Creates an Iaptic adapter for the specified payment platform

#### Parameters

##### config

[`Config`](globals.md#config)

Configuration options for the adapter

#### Returns

[`IapticStripe`](globals.md#iapticstripe)

An initialized adapter instance

#### Throws

Error if the specified adapter type is not supported

#### Example

```ts
const iaptic = createAdapter({
  type: 'stripe',
  appName: 'my-app',
  apiKey: '1234567890',
  stripePublicKey: 'pk_test_...'
});
```
