import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

// ─── Models (register discriminators before routes) ───────────────────────────
import './models/Person.model.js';
import './models/User.model.js';
import './models/Volunteer.model.js';
import './models/Reporter.model.js';
import './models/ResponseTeam.model.js';
import './models/MinorReport.model.js';
import './models/MajorReport.model.js';
import './models/Notification.model.js';

// ─── Routes ───────────────────────────────────────────────────────────────────
import userRoutes from './routes/user.routes.js';
import volunteerRoutes from './routes/volunteer.routes.js';
import reporterRoutes from './routes/reporter.routes.js';
import responseTeamRoutes from './routes/responseTeam.routes.js';
import minorReportRoutes from './routes/minorReport.routes.js';
import majorReportRoutes from './routes/majorReport.routes.js';
import notificationRoutes from './routes/notification.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Protocol Zero API is running 🚀',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      volunteers: '/api/volunteers',
      reporters: '/api/reporters',
      responseTeam: '/api/response-team',
      minorReports: '/api/minor-reports',
      majorReports: '/api/major-reports',
      notifications: '/api/notifications',
    },
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/users', userRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/reporters', reporterRoutes);
app.use('/api/response-team', responseTeamRoutes);
app.use('/api/minor-reports', minorReportRoutes);
app.use('/api/major-reports', majorReportRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── Connect DB then start server ─────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
