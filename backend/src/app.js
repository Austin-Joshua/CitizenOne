const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const aiRoutes = require('./routes/ai');
const schemeRoutes = require('./routes/schemes');
const opportunityRoutes = require('./routes/opportunities');
const documentRoutes = require('./routes/documents');
const notificationRoutes = require('./routes/notifications');

const app = express();

// Middleware
app.use(helmet());
const corsOrigin = process.env.CORS_ORIGIN;
if (corsOrigin) {
  app.use(
    cors({
      origin: corsOrigin.split(',').map((s) => s.trim()),
      credentials: true,
    })
  );
} else {
  app.use(cors());
}
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Citizen One API is healthy' });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Citizen One Backend running on port ${PORT}`);
});

module.exports = app;
