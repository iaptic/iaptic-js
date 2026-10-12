# Changelog

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
