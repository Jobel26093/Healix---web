const express = require('express');
const cors = require('cors');

const path = require('path');

const authRoutes = require('./routes/auth');
const patientsRoutes = require('./routes/patients');
const appointmentsRoutes = require('./routes/appointments');
const timingsRoutes = require('./routes/timings');
const nurseRoutes = require('./routes/nurse');
const paymentsRoutes = require('./routes/payments');
const adminNursesRoutes = require('./routes/adminNurses');
const mapRoutes = require('./routes/map');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve built frontend web assets if dist folder exists
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[PhysioCare API] ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | ${duration}ms`);
  });
  next();
});

// Root API endpoint
app.get(['/api', '/api/'], (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Healix Care & Rehabilitation Clinic Backend Engine v2.0',
    endpoints: {
      auth: '/api/auth',
      patients: '/api/patients',
      appointments: '/api/appointments',
      timings: '/api/timings',
      health: '/api/health'
    },
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Healix Care & Rehabilitation Clinic Backend Engine',
    authorizedAdminEmails: ["calvinjoelc@gmail.com"],
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Mount Physiotherapy Clinic API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/timings', timingsRoutes);
app.use('/api/nurse', nurseRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/admin/nurses', adminNursesRoutes);
app.use('/api/map', mapRoutes);

// Unknown API routes fallback handler
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API Endpoint Not Found',
    path: req.originalUrl,
    availableEndpoints: ['/api/auth', '/api/patients', '/api/appointments', '/api/timings', '/api/health']
  });
});

// SPA fallback: Serve frontend index.html for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ error: 'Web frontend assets not built yet. Run npm run build in client directory.' });
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Healix Server Error]', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

if (require.main === module || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🏥 Healix Care Clinic Web Application running at http://localhost:${PORT}`);
    console.log(`🔗 REST API Root: http://localhost:${PORT}/api`);
    console.log(`🔐 Admin Doctor Whitelist: calvinjoelc@gmail.com`);
    console.log(`🩺 Clinic Nurse Staff: Managed exclusively by Attending Doctor via Admin Portal`);
    console.log(`====================================================`);
  });
}

module.exports = app;
