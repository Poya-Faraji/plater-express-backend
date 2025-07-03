import jwt from 'jsonwebtoken'


export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired',
        expired: true 
      });
    }
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};