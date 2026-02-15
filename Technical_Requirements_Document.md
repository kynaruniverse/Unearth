# Technical Requirements – Unearth

Version: V1 → V3 Evolution Plan

---

# 1. Core Principles

- Mobile-first architecture
- Offline-first behavior (V1)
- Performance-first
- Minimal dependencies
- Progressive enhancement
- Scalable upgrade path

---

# 2. V1 Technical Stack

Frontend:
- HTML5
- CSS3 (custom, no frameworks)
- Vanilla JavaScript (ES6+)

Storage:
- LocalStorage (client-side only)

PWA:
- manifest.json
- service-worker.js

Hosting:
- GitHub
- Netlify

Domain:
unearthapp.co.uk

No backend.
No database.
No authentication.

---

# 3. Performance Requirements

- First load < 2 seconds
- Lighthouse score > 90
- No blocking scripts
- Compressed assets
- CSS < 50KB
- JS < 100KB (V1)

---

# 4. Security Requirements

V1:
- No remote storage
- No user accounts
- Input sanitization (prevent script injection)
- HTTPS enforced

V2+:
- JWT authentication
- Encrypted data in transit (TLS)
- Secure Stripe payment integration
- GDPR compliance
- Data deletion request system

---

# 5. Scalability Upgrade Path

V1 → V2 Migration Plan:

Step 1:
Replace LocalStorage with abstraction layer.

Step 2:
Introduce cloud database (Supabase or Firebase).

Step 3:
Add authentication layer.

Step 4:
Introduce Stripe subscription handling.

Architecture must allow this migration without rewriting UI logic.