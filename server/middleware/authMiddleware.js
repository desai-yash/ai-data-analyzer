export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  const error = new Error('Authentication required');
  error.statusCode = 401;
  next(error);
};
