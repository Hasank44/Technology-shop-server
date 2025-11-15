const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    const { _id } = req.user;

    if (!_id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not found'
      });
    };
    const role = req.user.role;
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: ' You do not have permission'
      });
    };

    next();
  };
};

export default roleMiddleware;
