import { Router } from 'express';
import { OperationsController } from '../controllers/operations.controller.js';
import { authenticate } from '../../../core/middlewares/authMiddleware.js';

export const manufacturingRouter = Router();
export const bomRouter = Router();

// Manufacturing Routes
manufacturingRouter.get('/', authenticate, OperationsController.getMOs);
manufacturingRouter.post('/', authenticate, OperationsController.createMO);
manufacturingRouter.post('/:id/confirm', authenticate, OperationsController.confirmMO);
manufacturingRouter.post('/:id/produce', authenticate, OperationsController.produceMO);
manufacturingRouter.post('/:id/cancel', authenticate, OperationsController.cancelMO);

// Nested Updates
manufacturingRouter.patch('/work-order/:id/status', authenticate, OperationsController.updateWorkOrderStatus);
manufacturingRouter.patch('/work-order/:id/duration', authenticate, OperationsController.updateWorkOrderDuration);
manufacturingRouter.patch('/component/:id/consumed', authenticate, OperationsController.updateComponentConsumed);

// BoM Routes (kept simple for now)
bomRouter.get('/', authenticate, async (req, res) => {
    // Legacy support or basic list
    const { OperationsRepository } = await import('../repositories/operations.repository.js');
    try {
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new (PrismaClient as any)();
        const boms = await prisma.boM.findMany({ include: { product: true, bomLines: { include: { component: true } }, operations: { include: { workCenter: true } } } });
        res.json(boms);
    } catch (e) {
        res.status(500).json({ error: 'Failed' });
    }
});
