# Loyola ERP - Backend Developer Documentation

This backend powers the **Loyola College ERP** system. It handles Staff/Student authentication, Attendance management, and Master data retrieval.

**Tech Stack:** Next.js (App Router), MongoDB (Mongoose), JWT Auth.

---

## 1. Staff Authentication

The system uses a **Dual Token System** (Access Token + Refresh Token) with device binding.

### **Login**

**Endpoint:** `POST /api/auth/login`

- **Logic:**
  - Validates email.
  - **Temp Logic:** Currently checks if `password === contactNumber` (will be replaced with bcrypt later).
  - Generates a short-lived **Access Token** (15 mins).
  - Generates a long-lived **Refresh Token** (30 days), hashes it (SHA-256), and stores it in DB.
- **Returns:** `accessToken`, `refreshToken`, `deviceId`.

### **Refresh Token**

**Endpoint:** `POST /api/auth/refresh`

- **Purpose:** Get a new Access Token when the old one expires without logging out.
- **Security:**
  - Hashes the incoming token and looks for a match.
  - **Rotation:** Revokes the old refresh token and issues a brand new pair (Rotation).
  - **Device Check:** Ensures the request comes from the same `deviceId` that logged in.

### **Get Current Profile**

**Endpoint:** `GET /api/auth/me`

- **Headers:** `Authorization: Bearer <token>`
- **Logic:** Decodes JWT -> Finds Staff -> Returns simplified profile (`name`, `email`, `role`).

### **Logout**

**Endpoint:** `POST /api/auth/logout`

- **Logic:** Marks the refresh token as `revoked: true` in the database.

---

## 2. Attendance System

### **Mark Attendance**

**Endpoint:** `POST /api/attendance/mark-attendance`

- **How it works:**
  - Accepts `classId`, `date`, `hour`, and an array of `records` (student ID + status).
  - **Duplicate Check:** Before saving, it checks if a record already exists for that Class + Date + Hour. If yes, returns `409 Conflict`.
  - **Note:** Currently hardcodes `staffId` (needs to be updated to use JWT user).

### **Get Attendance (Logs)**

**Endpoint:** `GET /api/attendance/get-attendance`

- **Filters (Query Params):** `class`, `staffId`, `date`, `hour`.
- **Logic:**
  - Builds a dynamic MongoDB filter.
  - If `date` is provided, it searches the _entire day_ (00:00 to 23:59).
  - **Populates:** Expands references to show real names for Staff, Class, and Students.

---

## 3. Master Data (Dropdowns)

These APIs are lightweight and optimized for populating UI dropdowns.

### **Get Courses**

**Endpoint:** `GET /api/data/course/get-course`

- **Returns:** List of all courses, sorted alphabetically. Includes Stream info.

### **Get Classes (Sections)**

**Endpoint:** `GET /api/data/class/get-section`

- **Query Params:** `courseId` (Required), `year` (Optional).
- **Returns:** Classes sorted by Year (1, 2, 3) -> Section (A, B, C).

### **Get Students (For Attendance List)**

**Endpoint:** `GET /api/data/student/get-student`

- **Query Params:** `class` (Required).
- **Returns:** A lightweight list of students (`_id`, `name`, `rollNo`).
- **Optimization:** Uses `.select()` to fetch _only_ what is needed for the attendance checkboxes, reducing data transfer.

---

## Developer Notes & Todos

1.  **Hardcoded IDs:** `POST /mark-attendance` currently uses a dummy Staff ID. Update this to extract ID from the request token.
2.  **Password Hashing:** `POST /login` compares plain text passwords. Need to implement `bcrypt.compare` for production.
3.  **Role Management:** The JWT payload includes `role`, but we need to add Middleware to protect routes (e.g., only Admin can create Staff).
