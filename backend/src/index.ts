import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import bomRoutes from './routes/bomRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import manufacturingRoutes from './routes/manufacturingRoutes.js';
import authRoutes from './routes/authRoutes.js';
import configRoutes from './routes/configRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import financeRoutes from './routes/financeRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/boms', bomRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/manufacturing', manufacturingRoutes);
app.use('/api/config', configRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/finance', financeRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
