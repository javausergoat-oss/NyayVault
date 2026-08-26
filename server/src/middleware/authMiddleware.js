import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sih-prototype-super-secret-key';

/**
 * Validates JWT token from the Authorization header.
 * For Phase 5, we enforce strict JWT.
 */
export async function authenticateUser(req, res, next) {
  // Allow healthcheck and login to bypass auth
  if (req.path === '/api/health' || req.path === '/api/auth/login' || req.path === '/api/auth/users') {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    
    // Inject user info into request
    req.user = userPayload;
    
    // Fallback for older endpoints that rely on x-user-id header
    req.headers['x-user-id'] = userPayload.id;
    
    next();
  });
}

export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient role permissions.' });
    }
    next();
  };
}
