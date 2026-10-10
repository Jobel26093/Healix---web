# 🏥 Healix Advance Physiotherapy & Rehabilitation Center

[![Live Web Application](https://img.shields.io/badge/Live_App-Render_Cloud-00b4d8?style=for-the-badge&logo=render&logoColor=white)](https://healix-care-clinic.onrender.com)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Jobel26093/Healix---Website)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

A modern, full-stack clinical management and patient rehabilitation platform built with **React 19**, **Vite**, and **Node.js Express**, featuring role-based access control (RBAC), multi-portal authentication, and a complete **Java (JDK 21) Middleware Suite**.

---

## 🌐 Live Web Application

- 🚀 **Live Demo URL**: [https://healix-care-clinic.onrender.com](https://healix-care-clinic.onrender.com)
- ⚙️ **Backend Health Endpoint**: [https://healix-care-clinic.onrender.com/api/health](https://healix-care-clinic.onrender.com/api/health)

### 🔐 Demo Credentials for All 3 Portals:
| Portal | Login Identifier | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **🛡️ Doctor / Executive Admin** | `calvinjoelc@gmail.com` | `adminpassword123` | Master registry, staff onboarding, fees & income ledger, timetable control |
| **🩺 Junior Physiotherapist** | `anitha@physiocare.local` | `anitha123` | Patient queue, clinical session notes, rehab observations |
| **🏠 Patient Portal** | `john.doe@example.com` | `userpassword123` | Book slot / home visit, view appointments, payment receipts |

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
| **Cloud Deployment** | Render Blueprint (`render.yaml`) & Vercel (`vercel.json`) |

---

## ☁️ 1-Click Free Cloud Deployment

### Deploying on Render (Recommended for Full-Stack)
1. Click the **[Deploy to Render](https://render.com/deploy?repo=https://github.com/Jobel26093/Healix---Website)** button above.
2. Sign in with your GitHub account (`Jobel26093`).
3. Render will automatically read [`render.yaml`](render.yaml) and configure:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
4. Click **Create Web Service**.
5. Once built (takes ~1-2 minutes), Render gives you a live permanent HTTPS URL (e.g., `https://healix-care-clinic.onrender.com`).
6. Copy that URL and paste it into your GitHub repository under **About ⚙️ -> Website**.

---

## 🚀 Local Development Setup

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

2. **Install and Build**:
   ```bash
   npm run build
   ```

3. **Start both Frontend & Backend in Development Mode**:
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