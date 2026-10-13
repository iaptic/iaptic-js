# Changelog

## 1.1.1

- Docs: fix README quick start (`getProducts()`, no `stripePublicKey`); `getCatalog()` never existed

## 1.1.0

Type fixes so the declarations match what the server sends. Values the server never sends are kept as `@deprecated` so 1.0.4 code still compiles; they will be removed in the next major.

- Fix types: `PricingPhase.paymentMode` adds `'UpFront'` and `'FreeTrial'`. `'PayUpFront'` is deprecated (never sent)
- Fix types: `Offer.offerType` adds `'Introductory'`
- Fix types: `ProductType` adds `'non consumable'`, `'non renewing subscription'`, `'application'` and `'product'`. `'non_consumable'` is deprecated (never sent)
- Fix types: `Purchase.renewalIntent` adds `'Lapse'`. `'Cancel'` is deprecated (never sent)
- Fix types: `PlanChange.purchaseId` is optional
- Fix types: fields the server may omit are now optional: `PricingPhase.currency`, `billingPeriod`, `recurrenceMode`; `Purchase.purchaseDate`, `lastRenewalDate`, `expirationDate`, `renewalIntent`, `isTrialPeriod`, `amountMicros`, `currency`. With `strict` on, code that reads them as always present now gets a compile error; check them before use (a one-time purchase has no `expirationDate`)
- Build with @rollup/plugin-typescript; package declares `engines.node >= 20`

## 1.0.4

- Remove stripePublicKey from config (it isn't required)
- Added onAccessTokenChange()

## 1.0.3

- Added version to global window.IapticJS object

## 1.0.2

- Added global window.IapticJS object for browser environments
- Added Utils module
- Added IapticStripe module
