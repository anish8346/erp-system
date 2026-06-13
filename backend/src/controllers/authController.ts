import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import { logActivity } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'SALES',
      },
    });

    await logActivity(user.id, 'REGISTER', 'USER', user.id, `New user registered: ${user.email}`);
    res.status(201).json({ message: 'User created successfully', userId: user.id });
  } catch (error: any) {
    console.error('[Register Error]:', error);
    res.status(500).json({ error: 'System failed to register user. Please try again later.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    
    await logActivity(user.id, 'LOGIN', 'USER', user.id, `User logged in: ${user.email}`);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error('[Login Error]:', error);
    res.status(500).json({ error: 'Login service currently unavailable.' });
  }
};
