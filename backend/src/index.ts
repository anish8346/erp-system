import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Module Routes
import productRoutes from './modules/products/productRoutes.js';
import bomRoutes from './modules/manufacturing/bomRoutes.js';
import salesRoutes from './modules/sales/salesRoutes.js';
import purchaseRoutes from './modules/purchase/purchaseRoutes.js';
import manufacturingRoutes from './modules/manufacturing/manufacturingRoutes.js';
import authRoutes from './modules/auth/authRoutes.js';
import configRoutes from './modules/administration/configRoutes.js';
import requestRoutes from './modules/administration/requestRoutes.js';
import vendorRoutes from './modules/purchase/vendorRoutes.js';
import financeRoutes from './modules/finance/financeRoutes.js';

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
