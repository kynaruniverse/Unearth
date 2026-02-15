# Test Plan – Unearth V1

---

# 1. Functional Testing

Test Case 1:
Add new item.
Expected:
Item appears in list.

Test Case 2:
Log lost event.
Expected:
Total lost increases by 1.

Test Case 3:
Log found location.
Expected:
Location frequency increases.

Test Case 4:
Reload browser.
Expected:
Data persists.

Test Case 5:
Delete LocalStorage.
Expected:
App resets cleanly.

---

# 2. Edge Cases

- Empty item name
- Duplicate items
- Extremely long location names
- Special characters

---

# 3. Browser Testing

- Chrome (Android)
- Safari (iOS)
- Firefox

---

# 4. Performance Testing

Run Lighthouse audit:
- Performance > 90
- Accessibility > 90
- Best Practices > 90

---

# 5. Offline Testing

1. Load site.
2. Turn off internet.
3. Refresh.
Expected:
App loads successfully.

---

# 6. Pre-Launch Checklist

- No console errors
- HTTPS active
- PWA installable
- All core features working
- Mobile responsive