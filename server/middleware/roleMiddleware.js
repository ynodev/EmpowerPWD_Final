export const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRole = req.user.role.toLowerCase();
      
      if (!allowedRoles.map(role => role.toLowerCase()).includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }

      next();
    } catch (error) {
      console.error('Error in role middleware:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
}; 