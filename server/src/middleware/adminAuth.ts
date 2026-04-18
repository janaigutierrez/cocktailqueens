import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AdminRequest extends Request {
  isAdmin?: boolean;
}

export const adminAuth = (req: AdminRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'default-secret';
    jwt.verify(token, secret);
    req.isAdmin = true;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
