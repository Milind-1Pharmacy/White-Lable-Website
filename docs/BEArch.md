# SpaceMonk — Backend Tech Stack Overview

> For the frontend team — so proposed solutions stay compatible with what the backend can support.

---

## Runtime & Deployment

| What | Tech |
|------|------|
| Language | Python 3.9 |
| Platform | AWS Lambda (Serverless) |
| Deploy | Serverless Framework |
| Region | AWS Mumbai (ap-south-1) |
| Sync requests | 25s max timeout |
| Background jobs | 15 min max timeout (async Lambda) |

---

## Database

- **AWS DynamoDB** — NoSQL, single-table design
- No SQL / no joins
- Data is pre-shaped per access pattern using GSIs (Global Secondary Indexes)

---

## Storage

- **AWS S3** — all images and files
- Backend provides presigned URLs → FE can upload directly to S3
- Images served as public CDN URLs

---

## Authentication

- Custom session tokens (phone + OTP flow)
- No JWT, no OAuth
- Token passed as `session-token` header on every request

---

## Push Notifications

- **Firebase Cloud Messaging (FCM)** — Android + iOS
- Backend sends push directly; FE registers FCM token with backend on login

---

## SMS

- Third-party SMS gateway (India-based)
- Used for OTP delivery and delivery customer notifications

---

## Facial Recognition

- External AI REST service
- FE sends image as `multipart/form-data` → backend handles the rest

---

## API Style

- **REST + JSON** (no GraphQL, no gRPC, no WebSocket)
- Image uploads use `multipart/form-data`
- Universal response envelope:
  ```json
  { "statusCode": 200, "data": { ... } }
  { "statusCode": 400, "error": { "userMessage": "..." } }
  ```
- CORS open for all origins

---

## Key Constraints FE Should Know

| Constraint | Implication |
|------------|-------------|
| No WebSocket | Use FCM push or polling for real-time updates |
| NoSQL (DynamoDB) | No arbitrary filtering — data comes pre-aggregated per access pattern |
| AWS Lambda (serverless) | Cold starts possible; no persistent in-memory state between requests |
| Images must be JPEG or PNG | Validate format and size on FE before upload |
| Session token auth | Store token securely after login, include on every authenticated call |
| Async jobs (15 min timeout) | FE triggers via standard POST; result delivered via FCM push or polling |
