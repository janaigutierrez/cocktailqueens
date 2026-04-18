import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      res.status(500).json({ error: 'Admin password not configured' });
      return;
    }

    const hashedAdmin = await bcrypt.hash(adminPassword, 10);
    const isMatch = await bcrypt.compare(password, hashedAdmin);

    if (!isMatch) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'default-secret';
    const token = jwt.sign({ role: 'admin' }, secret, { expiresIn: '24h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const verifyAdmin = async (_req: Request, res: Response) => {
  res.json({ valid: true });
};
