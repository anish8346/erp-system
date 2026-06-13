import type { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export const createBoM = async (req: Request, res: Response) => {
  try {
    const { productId, name, components, operations } = req.body;
    
    // Use transaction to ensure consistency
    const bom = await prisma.$transaction(async (tx) => {
      // Check if BoM already exists
      const existingBom = await tx.boM.findUnique({ where: { productId } });
      
      if (existingBom) {
        // Delete old lines and operations
        await tx.boMLine.deleteMany({ where: { bomId: existingBom.id } });
        await tx.operation.deleteMany({ where: { bomId: existingBom.id } });
        
        // Update BoM name and recreate everything
        return await tx.boM.update({
          where: { id: existingBom.id },
          data: {
            name,
            bomLines: {
              create: components.map((c: any) => ({
                componentId: c.componentId,
                quantity: Number(c.quantity),
              })),
            },
            operations: {
              create: (operations || []).map((o: any) => ({
                name: o.name,
                duration: Number(o.duration),
                workCenterId: o.workCenterId,
              })),
            },
          },
          include: { bomLines: true, operations: true },
        });
      } else {
        // Create new BoM
        return await tx.boM.create({
          data: {
            productId,
            name,
            bomLines: {
              create: components.map((c: any) => ({
                componentId: c.componentId,
                quantity: Number(c.quantity),
              })),
            },
            operations: {
              create: (operations || []).map((o: any) => ({
                name: o.name,
                duration: Number(o.duration),
                workCenterId: o.workCenterId,
              })),
            },
          },
          include: { bomLines: true, operations: true },
        });
      }
    });

    // Update product with bomId if not already set
    await prisma.product.update({
      where: { id: productId },
      data: { bomId: bom.id },
    });

    res.status(201).json(bom);
  } catch (error: any) {
    console.error("BoM Creation Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getBoMs = async (req: Request, res: Response) => {
  try {
    const boms = await prisma.boM.findMany({
      include: {
        product: true,
        bomLines: { include: { component: true } },
      },
    });
    res.json(boms);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
