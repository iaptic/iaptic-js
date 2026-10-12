# Changelog

## Unreleased

- Fix types: `PricingPhase.paymentMode` adds `'UpFront'` and `'FreeTrial'`, the values the server sends. `'PayUpFront'` is deprecated (never sent) and kept until the next major
- Fix types: `Offer.offerType` adds `'Introductory'`
- Fix types: `ProductType` adds `'non renewing subscription'`, `'application'` and `'product'`; `'non_consumable'` is back as a deprecated value so 1.0.4 code still compiles
- Fix types: fields the server may omit are now optional: `PricingPhase.currency`, `billingPeriod`, `recurrenceMode`; `Purchase.purchaseDate`, `lastRenewalDate`, `expirationDate`, `renewalIntent`, `isTrialPeriod`, `amountMicros`, `currency`. With `strict` on, code that reads them as always present now gets a compile error; check them before use (a one-time purchase has no `expirationDate`)

## 1.0.5

- Fix types: `Purchase.renewalIntent` is `'Lapse' | 'Renew'` (was `'Renew' | 'Cancel'`)
- Fix types: `PlanChange.purchaseId` is optional
- Fix types: `ProductType` uses `'non consumable'` (was `'non_consumable'`)
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
