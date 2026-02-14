import { Request, Response, NextFunction } from 'express';

const adminTokens = new Set<string>();

export const generateToken = (): string => {
  const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  adminTokens.add(token);
  return token;
};

export const verifyPassword = (password: string): boolean => {
  return password === process.env.ADMIN_PASSWORD;
};

export const verifyToken = (token: string): boolean => {
  return adminTokens.has(token);
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};
