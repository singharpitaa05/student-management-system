# React Student Management System — Architecture Plan

**Stack:** React.js (frontend) · Node.js + Fastify (backend) · MongoDB (database) · Cloudinary (media) · Nodemailer/Gmail SMTP (email) · Razorpay (payments)

---

## 1. High-Level Architecture

This is best built as a **modular monolith** — one Fastify backend, cleanly separated into feature modules, talking to one MongoDB instance and three external services. Microservices would be overkill at this scale and would slow you down without real benefit; the modular structure below gives you the same separation of concerns and an easy migration path later if you ever need to split services out.

```
                         ┌───────────────────────────┐
                         │   React SPA (Vite/CRA)    │
                         │  Admin / Teacher / Student │
                         │        Dashboards          │
                         └─────────────┬───────────────┘
                                       │ Axios (JWT in headers)
                                       ▼
                         ┌───────────────────────────┐
                         │      Fastify REST API      │
                         │  Route → Controller →      │
                         │  Service → Model layer     │
                         │  + RBAC middleware          │
                         │  + Fastify JSON validation  │
                         └───┬──────────┬──────────┬──┘
                             │          │          │
                 ┌───────────┘   ┌──────┘    ┌─────┘
                 ▼                ▼           ▼
          ┌─────────────┐ ┌──────────────┐ ┌────────────┐
          │  MongoDB     │ │  Cloudinary  │ │ Nodemailer │
          │ (Mongoose)   │ │ (profile imgs)│ │ (Gmail SMTP)│
          └─────────────┘ └──────────────┘ └────────────┘
                                       │
                                       ▼
                               ┌───────────────┐
                               │   Razorpay    │
                               │ (fee payments)│
                               └───────────────┘
```

**Layering inside the backend (per module):**
`Route (schema + auth)` → `Controller (HTTP in/out)` → `Service (business logic)` → `Model (Mongoose/DB)`

This keeps controllers thin, business logic testable in isolation, and DB access swappable later.

---

## 2. Roles & RBAC

### 2.1 Roles

| Role | How the account is created |
|---|---|
| **Admin** | Never via public signup. Created via a one-time seed script or by an existing Admin through a protected endpoint. |
| **Teacher** | Created by Admin only (invite/create endpoint), not public signup. Included from v1. |
| **Student** | Created two ways: (a) self-registration via public `/signup`, or (b) created directly by Admin. Public signup **always** forces `role = student` server-side — the client can never set its own role. |

This directly satisfies your access rule: *"Only Admin can create new students/data; students can register and update their own details."* The key implementation detail is that the `role` field is **never accepted from client input** on signup — it's hardcoded server-side, and only an authenticated Admin route can assign `admin`/`teacher` roles.

### 2.2 Permission Matrix

| Module / Action | Admin | Teacher | Student |
|---|:---:|:---:|:---:|
| Self-register (signup) | — | — | ✅ |
| Create student record directly | ✅ | ❌ | ❌ |
| View all students | ✅ | ✅ (assigned batch) | ❌ |
| Update any student's record | ✅ | ❌ | ❌ |
| Update **own** profile | ✅ | ✅ | ✅ |
| Delete a student | ✅ | ❌ | ❌ |
| View global dashboard/stats | ✅ | Limited (own class stats) | ❌ (own summary only) |
| Mark attendance | ✅ | ✅ | ❌ |
| View own attendance | — | — | ✅ |
| Create/manage courses | ✅ | ✅ (assigned courses only) | ❌ |
| View courses / enroll (free) | ✅ | ✅ | ✅ (view own) |
| Purchase a paid course (Razorpay) | — | — | ✅ (auto-enrolled on successful payment) |
| Send notifications (broadcast/email) | ✅ (all) | ✅ (own course/class only) | ❌ |
| Receive notifications (in-app + email) | ✅ | ✅ | ✅ |
| Export student data (Excel/PDF) | ✅ | Limited (own class) | Own record only |
| View all payment/fee records | ✅ | ❌ | ❌ |
| View own payment history | — | — | ✅ |

### 2.3 Implementation approach

- JWT payload carries `{ userId, role }`.
- A single `authenticate` preHandler verifies the JWT and attaches `request.user`.
- A `authorize(...roles)` preHandler factory checks `request.user.role` against an allowed list, used declaratively on each route:
  ```js
  fastify.get('/students', { preHandler: [authenticate, authorize('admin','teacher')] }, controller.list)
  ```
- For "own resource" checks (e.g., a student updating their own profile), add a resource-ownership check in the service layer comparing `request.user.userId` to the resource's owner id — role alone isn't enough here.

---

## 3. Database Schema (MongoDB / Mongoose)

Use a **base `User` collection with Mongoose discriminators** for Admin/Teacher/Student — they share auth fields, and Student/Teacher just extend with role-specific fields. This avoids duplicating auth logic across three collections.

**User (base, discriminator key: `role`)**
```
name, email (unique), password (hashed), role [admin|teacher|student],
avatarUrl, phone, isActive, isEmailVerified, refreshTokenHash, timestamps
```

**Student (discriminator)**
```
rollNumber, batch/courseRef, admissionDate, dob, address,
guardianName, guardianPhone, feeStatus [enum]
```

**Teacher (discriminator, optional)**
```
subjects [array], assignedCourses [ref: Course]
```

**Course**
```
title, code (unique), description, durationMonths, fee,
teacherRef, enrolledStudents [ref: Student], createdBy, timestamps
```

**Attendance**
```
studentRef, courseRef, date, status [present|absent|leave], markedBy (userRef)
```
Index: `{ studentRef: 1, courseRef: 1, date: 1 }` unique — prevents duplicate marks for the same day.

**Notification**
```
title, message,
type [broadcast|role|individual],
category [holiday|enrollment|offer|attendance|payment|general],
channel [in_app|email|both],
targetRole, targetUser, courseRef (optional, for teacher's own-course broadcasts),
createdBy, readBy [array of userRefs], emailSentAt, timestamps
```
`channel` decides whether the notification is stored for the in-app bell icon, dispatched by email, or both — e.g. a holiday announcement is typically `both`, while a payment receipt is typically `email`-only.

**Payment**
```
studentRef, courseRef, amount, razorpayOrderId, razorpayPaymentId,
razorpaySignature, status [created|paid|failed], paidAt
```
On `status: paid` (verified server-side), two things fire automatically: (1) `studentRef` is added to `Course.enrolledStudents`, and (2) an `enrollment`/`payment` category notification + receipt email is dispatched. This keeps "pay" and "enroll" atomic from the student's point of view — they never manually enroll in a paid course.

---

## 4. Backend Structure (Fastify)

```
student-management-backend/
├── src/
│   ├── app.js                     # builds Fastify instance, registers plugins/routes
│   ├── server.js                  # entry point — starts the server
│   ├── config/
│   │   ├── env.config.js          # validates process.env (e.g. via zod) at boot
│   │   ├── db.config.js           # mongoose connection
│   │   ├── cloudinary.config.js
│   │   ├── razorpay.config.js
│   │   └── mailer.config.js
│   ├── plugins/                   # fastify-native plugins (encapsulated, reusable)
│   │   ├── auth.plugin.js         # decorates fastify with `authenticate`
│   │   ├── swagger.plugin.js      # @fastify/swagger + swagger-ui
│   │   ├── cors.plugin.js
│   │   ├── rateLimit.plugin.js
│   │   └── multipart.plugin.js
│   ├── emails/
│   │   ├── templates/             # HTML email templates (handlebars/ejs)
│   │   │   ├── welcome.hbs
│   │   │   ├── password-reset.hbs
│   │   │   ├── enrollment-confirmation.hbs
│   │   │   ├── payment-receipt.hbs
│   │   │   ├── holiday-announcement.hbs
│   │   │   └── offer-announcement.hbs
│   │   └── mailer.service.js      # wraps Nodemailer: renders template + sends
│   ├── modules/                   # one folder per feature — the core of the app
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.schema.js     # Fastify JSON schema (validation + auto Swagger docs)
│   │   ├── student/
│   │   │   ├── student.routes.js
│   │   │   ├── student.controller.js
│   │   │   ├── student.service.js
│   │   │   └── student.schema.js
│   │   ├── dashboard/
│   │   ├── attendance/
│   │   ├── course/
│   │   ├── notification/
│   │   ├── payment/
│   │   └── upload/
│   ├── models/                    # Mongoose schemas + discriminators
│   │   ├── user.model.js
│   │   ├── student.model.js
│   │   ├── teacher.model.js
│   │   ├── course.model.js
│   │   ├── attendance.model.js
│   │   ├── notification.model.js
│   │   └── payment.model.js
│   ├── middlewares/
│   │   ├── rbac.middleware.js     # authorize(...roles)
│   │   └── errorHandler.middleware.js
│   ├── utils/
│   │   ├── apiResponse.js         # consistent { success, data, message } shape
│   │   ├── apiError.js
│   │   ├── logger.js              # pino (built into Fastify)
│   │   ├── exportToExcel.js       # exceljs
│   │   └── exportToPDF.js         # pdfkit
│   └── jobs/                      # optional cron: fee reminders, attendance digest
├── tests/
├── .env.example
└── package.json
```

**Why this structure:** each module is self-contained (routes/controller/service/schema together), so you can reason about — or hand off — one feature at a time without touching unrelated code. `plugins/` holds cross-cutting Fastify concerns; `models/` is separated because schemas are shared across modules (e.g., `student.model` is used by both `student` and `attendance` modules).

---

## 5. Frontend Structure (React)

```
student-management-frontend/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   ├── PrivateRoute.jsx       # must be logged in
│   │   └── RoleBasedRoute.jsx     # must have an allowed role
│   ├── api/
│   │   ├── axiosInstance.js       # baseURL, request/response interceptors, token refresh
│   │   ├── auth.api.js
│   │   ├── student.api.js
│   │   ├── dashboard.api.js
│   │   ├── attendance.api.js
│   │   ├── course.api.js
│   │   ├── notification.api.js
│   │   └── payment.api.js
│   ├── features/                  # state slices (Redux Toolkit or Zustand), one per domain
│   │   ├── auth/
│   │   ├── students/
│   │   └── dashboard/
│   ├── pages/
│   │   ├── auth/          Login.jsx, Signup.jsx
│   │   ├── admin/         Dashboard.jsx, StudentList.jsx, StudentForm.jsx,
│   │   │                  Attendance.jsx, Courses.jsx, Notifications.jsx
│   │   └── student/       Profile.jsx, MyAttendance.jsx, MyCourses.jsx, FeePayment.jsx
│   ├── components/
│   │   ├── common/        Table, Modal, Button, SearchBar, Pagination, ImageUploader
│   │   └── layout/        Navbar, Sidebar, ProtectedLayout
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useDebounce.js         # for the search UI
│   │   └── useExport.js
│   ├── constants/
│   │   └── roles.js
│   └── utils/
├── .env.example
└── package.json
```

**Axios setup notes:** one shared instance with a request interceptor attaching the access token, and a response interceptor that catches 401s and attempts a silent refresh-token call before retrying — this is what "API Integration with Axios" should mean in a production app, not just a bare `axios.get()`.

---

## 6. Module-by-Module API Overview

| Module | Key Endpoints |
|---|---|
| **Auth** | `POST /auth/signup`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/forgot-password`, `POST /auth/reset-password` |
| **Student** | `GET /students` (search/filter/paginate), `GET /students/:id`, `POST /students` (admin), `PATCH /students/:id`, `DELETE /students/:id`, `PATCH /students/me` |
| **Dashboard** | `GET /dashboard/admin` (totals, recent enrollments, fee summary), `GET /dashboard/student` (own attendance %, courses, fee status) |
| **Attendance** | `POST /attendance`, `GET /attendance/student/:id`, `GET /attendance/course/:id` |
| **Course** | `GET /courses`, `POST /courses`, `PATCH /courses/:id`, `POST /courses/:id/enroll` |
| **Notification** | `GET /notifications`, `POST /notifications` (admin: any target · teacher: own course only — dispatches in-app and/or email per `channel`), `PATCH /notifications/:id/read` |
| **Upload** | `POST /upload/avatar` (multipart → Cloudinary → returns URL) |
| **Export** | `GET /students/export?format=excel|pdf` |
| **Payment** | `POST /payments/order` (create Razorpay order for a course), `POST /payments/verify` (verify signature, mark paid, auto-enroll, send receipt), `POST /payments/webhook` (Razorpay webhook — source of truth for reconciliation, independent of the client callback) |

---

## 7. API Documentation Strategy

Use **`@fastify/swagger` + `@fastify/swagger-ui`**. Because Fastify routes already require JSON Schema for validation, you get OpenAPI docs almost for free — define the schema once per route and it drives both request validation *and* the `/docs` page. This is the cleanest way to satisfy your "write the API documentation" requirement without maintaining a separate Postman collection by hand (though exporting one from Swagger for the team is a nice add-on).

---

## 8. Cross-Cutting Concerns / Security Checklist

- **Passwords:** bcrypt, never store plaintext.
- **Tokens:** short-lived access token (~15 min) + longer refresh token (~7 days), refresh token in an httpOnly cookie.
- **Validation:** Fastify's built-in JSON Schema on every route — reject malformed input before it reaches a controller.
- **Rate limiting:** `@fastify/rate-limit`, tightened specifically on `/auth/login` and `/auth/forgot-password`.
- **Headers/CORS:** `@fastify/helmet`, `@fastify/cors` restricted to your frontend origin.
- **File uploads:** validate mime type + size in `@fastify/multipart` *before* forwarding to Cloudinary.
- **Error handling:** one centralized error handler; never leak stack traces in production responses.
- **Env validation:** validate `process.env` at boot (fail fast if a required var is missing) rather than discovering it at runtime.
- **Razorpay:** always verify the payment signature server-side before marking a payment "paid" — never trust the client's success callback alone. Also implement the Razorpay **webhook** (with its own signature verification) as the true source of truth for payment status, since the client-side callback can be missed if the user closes the tab mid-flow.

---

## 9. Suggested Build Order

Building in this order roughly follows your dependency chain (auth before anything role-gated, students before attendance/courses that reference them):

1. **Phase 0** — Repo scaffolding, env config, DB connection, base Fastify plugins.
2. **Phase 1** — Auth + RBAC (signup/login/JWT/refresh, role middleware). Get this fully solid before anything else.
3. **Phase 2** — Student CRUD APIs, self-profile update, Cloudinary avatar upload.
4. **Phase 3** — React auth pages, Axios instance with interceptors, protected/role-based routing.
5. **Phase 4** — Student List UI (search + pagination) and Dashboard APIs/UI.
6. **Phase 5** — Attendance + Course management (admin/teacher).
7. **Phase 6** — Notifications: in-app storage + email dispatch via Nodemailer (`mailer.service.js` + templates) for holidays, offers, and course enrollment confirmations.
8. **Phase 7** — Export to Excel/PDF.
9. **Phase 8** — Razorpay course-purchase flow: create order → checkout → verify signature → auto-enroll student → webhook reconciliation → receipt email.
10. **Phase 9** — Swagger docs, tests, deploy.

---

## 10. Decisions Confirmed

- **Teacher role:** in scope from v1. Fully reflected in the RBAC matrix, the `User` discriminator, and the `authorize()` lists across routes (teachers can manage their own courses, mark attendance, and broadcast notifications/emails to their own course only).
- **Notifications:** in-app (`GET /notifications`) plus email via Nodemailer for holidays, offers, and course-enrollment confirmations. No real-time layer (Socket.io) needed for v1 — polling/on-demand fetch is sufficient since none of these events are time-critical to the second.
- **Razorpay:** scoped specifically to **course purchase**. A student initiates a payment when buying a course; on verified success the backend auto-enrolls them in that course and fires a receipt email + in-app notification. A webhook handler backs this up as the source of truth in case the client-side callback is missed.
