# Production security headers (CloudFront)

> **Why this exists:** the site is a static export (`output: "export"`) deployed to
> S3 behind CloudFront. Next.js edge handlers / middleware — including `proxy.ts` —
> **do not run** on a static export, so the hardening headers in `proxy.ts` are
> present only on the local dev/preview server, **never on the live site**. They
> must be re-created at the CDN. This doc is the source of truth for those headers.

## What to apply

Attach a **CloudFront Response Headers Policy** to each tenant distribution (the
ones `deploy:<tenant>` pushes to). It runs on every response, including the static
S3-origin HTML, so it covers the gap proxy.ts can't.

### Security headers (mirror of `proxy.ts`, CSP **enforced** not Report-Only)

| Header | Value |
| --- | --- |
| `Content-Security-Policy` | see CSP below (enforced) |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` | `DENY` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |

### CSP (enforced)

```
default-src 'self';
base-uri 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' https: data: blob:;
media-src 'self' https: data: blob:;
connect-src 'self' https://apiv2.1pharmacy.io https://*.amazonaws.com https://fonts.googleapis.com https://fonts.gstatic.com;
frame-ancestors 'none';
object-src 'none';
form-action 'self';
```

Notes:
- Dropped `'unsafe-eval'` from `script-src` (the dev value) — the exported site
  doesn't need it. Verify the production bundle has no eval; re-add only if a
  console CSP violation proves it's required.
- `'unsafe-inline'` on `script-src`/`style-src` is still required by Next's
  bootstrap + the builder's CSS-in-JS. Tighten to nonces/hashes if the builder is
  ever served from a CDN (today the builder runs at `/` in dev, not exported to a
  public tenant site).
- `frame-ancestors 'none'` blocks clickjacking — note the **builder preview iframe
  is same-origin**, so this does not break it (the rule only blocks foreign embedders).

## Apply via AWS CLI (per tenant)

```bash
# 1. Create the policy once (returns an Id):
aws cloudfront create-response-headers-policy \
  --profile <tenant> \
  --response-headers-policy-config file://cloudfront-security-headers.json

# 2. Attach the policy Id to the distribution's default cache behavior
#    (Console: Distribution → Behaviors → Edit → Response headers policy),
#    or via `aws cloudfront update-distribution`.

# 3. Invalidate so the new headers take effect:
npm run invalidate:<tenant>
```

A starter `cloudfront-security-headers.json` (CustomHeadersConfig + SecurityHeadersConfig
with the table above) should live alongside the deploy scripts.

## Verify

```bash
curl -I https://www.<tenant-domain>/        # check headers present
curl -sI https://www.<tenant-domain>/ | grep -i content-security-policy   # enforced, not -Report-Only
```

All six headers must appear, `Content-Security-Policy` (not `-Report-Only`), and
`X-Frame-Options: DENY`.
