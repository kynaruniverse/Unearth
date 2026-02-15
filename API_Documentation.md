# API Documentation – Unearth (V2+)

Base URL:
/api/v1/

---

# Authentication

Method:
JWT

Endpoint:
POST /auth/login
POST /auth/register

---

# Items

POST /items
GET /items
DELETE /items/{id}

---

# Logs

POST /logs
GET /logs
DELETE /logs/{id}

---

# Insights

GET /insights/monthly
GET /insights/predictions

---

# Response Format

JSON:
{
  success: true,
  data: {}
}