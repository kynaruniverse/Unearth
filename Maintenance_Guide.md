# Maintenance Guide – Unearth

Version: Ongoing Operations Manual

---

# 1. Maintenance Philosophy

- Small, consistent improvements.
- Never large uncontrolled rewrites.
- Stability > novelty.
- User trust is priority.

---

# 2. Weekly Maintenance Tasks

Every Week:

1. Check Netlify uptime.
2. Review GitHub Issues.
3. Fix minor bugs.
4. Test PWA install.
5. Review analytics (if enabled).
6. Scan for console errors.

Time required:
1–2 hours.

---

# 3. Monthly Maintenance Tasks

1. Run Lighthouse audit.
2. Review retention metrics.
3. Identify drop-off points.
4. Improve onboarding microcopy.
5. Review user feedback trends.

Optional:
Ship 1 small improvement per month.

---

# 4. Quarterly Review

Every 3 Months:

- Evaluate roadmap progress.
- Review monetisation metrics.
- Decide whether to expand or refine.
- Archive unused features.
- Clean codebase.

---

# 5. Data Handling

V1:
Data stored locally only.

V2:
- Enable encrypted database backups.
- Allow data deletion request.
- Implement account recovery.

Backup Strategy:
Database auto-backup daily (cloud phase).

---

# 6. Bug Handling Workflow

1. Reproduce issue.
2. Isolate root cause.
3. Patch locally.
4. Test in staging.
5. Deploy.
6. Announce fix publicly if relevant.

Never silently fix critical bugs without note.

---

# 7. Technical Debt Policy

If code becomes messy:
Schedule refactor sprint.
Never refactor during feature build.