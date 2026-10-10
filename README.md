# 🏥 Healix Advance Physiotherapy & Rehabilitation Center

A modern, full-stack clinical management and patient rehabilitation platform built with **React 19**, **Vite**, and **Node.js Express**, featuring role-based access control (RBAC), multi-portal authentication, and a complete **Java (JDK 21) Middleware Suite**.

---

## 🌟 Key Highlights

- **Multi-Role Workspaces**:
  - 🏠 **Patient Portal**: Self-service appointment scheduling, home visit requests, payment ledger, and official downloadable receipts.
  - 🩺 **Junior Physiotherapist Portal**: Daily session queues, treatment notes, exercise observation charting, and patient care management under supervising doctor.
  - 🛡️ **Doctor & Executive Admin Cockpit**: Chief Medical Officer dashboard, patient registry, consultation timetables, staff onboarding, financial analytics, and income tracking.
- **Doorstep Home Visit Dispatch**: GPS coordinates, custom landmark directions, and specialized home therapy slot booking.
- **Interactive Geospatial Map**: Leaflet-powered interactive clinic locator and directions to Sithalapakkam, Chennai.
- **Integrated Payment & Billing Engine**: Cash, UPI, and Card front-desk collection with automated tax-compliant invoice generation.
- **Java Middleware Suite**: Complete role authorization and request logging implementation compatible with pure JDK 21, Jakarta Servlet filters, and Spring Boot interceptors.

---

## 🏗️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Lucide Icons, Recharts, Leaflet, Vanilla CSS Design System |
| **Backend API** | Node.js, Express, CORS, Nodemailer, Dotenv |
| **Java Middleware** | JDK 21 `com.sun.net.httpserver.Filter`, Jakarta Servlet Filter, Spring Boot Interceptor |
| **Data Store** | JSON-backed clinical store with audit logging |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+ or v20+ recommended)
- **npm** (v9+)
- *(Optional for Java tests)*: **JDK 21**

### Quick Launch

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Jobel26093/Healix---Website.git
   cd Healix---Website
   ```

2. **Install dependencies**:
   ```bash
   # Install client dependencies
   cd client && npm install

   # Install server dependencies
   cd ../server && npm install

   # Return to project root
   cd ..
   ```

3. **Start both Frontend & Backend**:
   ```bash
   npm run dev
   ```

- 🌐 **Frontend App**: `http://localhost:5173`
- ⚙️ **Backend REST API**: `http://localhost:5000/api`
- 🏥 **Health Check**: `http://localhost:5000/api/health`

---

## ☕ Java Middleware Suite

Located under [`server/src/middleware/java/`](server/src/middleware/java):

```powershell
# Compile the Java middleware suite
javac -d "server/src/middleware/java/bin" "server/src/middleware/java/*.java"

# Run the standalone server and automated RBAC test suite
java -cp "server/src/middleware/java/bin" middleware.StandaloneMiddlewareDemo
```

---

## 📍 Clinic Information

- **Center**: Healix Advance Physiotherapy and Rehabilitation Center
- **Address**: 8/207 Pillayar Koil St, Nookampalayam Main Rd, Sithalapakkam, Chennai - 600131
- **Doctor / Clinic Contact**: `+91 73053 94549`
- **Hours**: Monday – Saturday: 09:00 AM – 07:00 PM (Evening Home Visits: 05:00 PM – 07:00 PM)