# Compliance

The business-profile-safe invariants the platform enforces on every tenant config before anything renders. Compliance always wins: if config and compliance disagree, compliance is what renders.

## Where it runs

`applyCompliance(rawApp, system)` in `lib/complianceFilter.ts:67` runs inside `getConfig()` / `getConfigBySlug()` (`lib/getConfig.ts`) — i.e. before any module receives props. It returns a sanitized copy of `AppConfig`; the raw tenant config never reaches a module unfiltered. The ruleset it reads is `configs/system.json` → `compliance` + `sectionAllowlist`.

The output config is pinned to `compliance.mode = "business-profile-safe"`.

## What it enforces

### 1. CTA label rewriting

`sanitizeCta()` (`lib/complianceFilter.ts:37`) normalizes a label (trim + lowercase) and, if it matches `system.compliance.unsafeCtaLabels`, swaps it for `system.compliance.safeCtaFallback` (`"Learn More"`). An empty/missing label also becomes the fallback. Applied to the hero CTA, which is also forced to `type: "safe-action"`.

Banned labels (`configs/system.json`): `Buy Now`, `Order`, `Order Now`, `Checkout`, `Add to Cart`, `Pay`, `Pay Now`, `Subscribe & Pay`.

### 2. Force-disabled features

For every flag in `system.compliance.forceDisabledFeatures` (`["enablePayments", "enableCart"]`), the filter sets `features[flag] = false` regardless of what the tenant config requested. The site is **non-transactional** — payments and cart never render in business-profile-safe mode.

### 3. Mandatory disclaimer

`compliance.disclaimer` is guaranteed: the filter uses the tenant's disclaimer if non-empty, else `system.compliance.defaultDisclaimer`. The footer renders it on every page, so a tenant can never ship a page without one.

### 4. Section allowlist

`content.sections[]` is filtered to only types present in `system.sectionAllowlist` (`isAllowedSection`, `lib/complianceFilter.ts:54`). Any section type not on the allowlist is dropped before dispatch — this is why a new section type must be added to the allowlist (see [MODULES.md](./MODULES.md#adding-a-new-module)).

Current allowlist: `hero`, `about`, `services`, `features`, `howItWorks`, `gallery`, `stats`, `savings`, `videoFeature`, `appStrip`, `testimonials`, `faq`, `aiStore`, `team`.

### 5. Support-only communication

Communication is routed through support/enquiry flows only — no checkout, no transactional forms. Per project policy (and Meta's WhatsApp rules), WhatsApp links are **support/enquiry only — never "order on WhatsApp."** Ordering happens off-site (in the app), and the website links out to it.

## Ruleset reference (`configs/system.json`)

```jsonc
"compliance": {
  "defaultMode": "business-profile-safe",
  "rules": [ /* human-readable summary of the above */ ],
  "unsafeCtaLabels": ["Buy Now", "Order", "Order Now", "Checkout",
                      "Add to Cart", "Pay", "Pay Now", "Subscribe & Pay"],
  "safeCtaFallback": "Learn More",
  "forceDisabledFeatures": ["enablePayments", "enableCart"],
  "defaultDisclaimer": "The information presented on this website is for general informational purposes only ..."
}
```

## Invariant summary

| Rule | Mechanism | Source |
| --- | --- | --- |
| Unsafe CTAs rewritten | `sanitizeCta` → fallback | `complianceFilter.ts:37` |
| Payments/cart always off | force-disable loop | `complianceFilter.ts:82` |
| Disclaimer always present | tenant value or system default | `complianceFilter.ts:87` |
| Only allowed sections render | allowlist filter | `complianceFilter.ts:54` |
| Mode pinned safe | `mode: "business-profile-safe"` | `complianceFilter.ts:99` |
| Non-transactional / WhatsApp support-only | link out, no checkout | policy + config |
