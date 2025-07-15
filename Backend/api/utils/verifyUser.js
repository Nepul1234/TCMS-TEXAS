import jwt from 'jsonwebtoken';
import  errorHandler  from './error.js';

const JWT_SECRET = 'Testing';

// export const verifyToken = (req, res, next) => {
//   const token = req.cookies.access_token;
//   if (!token) {
//     return next(errorHandler(401, 'Unauthorized token'));
//   }
//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) {
//       return next(errorHandler(401, 'Unauthorized'));
//     }
//     req.user = user;
//     next();
//   });
// };
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token)
     return next(errorHandler(401, 'Unauthorized token'));

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ message: 'Token expired' });
      }
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = decoded;
    next();
  });
};
