# Deployment Guide – Unearth

---

# Part 1: GitHub Setup

1. Create GitHub account.
2. Create new repository called "unearth".
3. Upload project files.
4. Commit changes.

---

# Part 2: Netlify Setup

1. Create Netlify account.
2. Click "Add New Site".
3. Connect GitHub.
4. Select "unearth" repository.
5. Deploy.

No build command required.
Publish directory: root.

---

# Part 3: Connect Domain

1. Buy domain (unearthapp.co.uk).
2. In Netlify → Domain Settings.
3. Add custom domain.
4. Update DNS in domain provider:
   - Add Netlify nameservers.
5. Wait for propagation.
6. Enable HTTPS (auto in Netlify).

---

# Part 4: PWA Verification

1. Open site in Chrome.
2. Inspect → Application tab.
3. Confirm:
   - Manifest loaded
   - Service worker active
4. Click "Install App".

---

# Part 5: Rollback

In Netlify:
Deploys → Click previous version → "Publish deploy".

Always keep at least 3 stable deploys.