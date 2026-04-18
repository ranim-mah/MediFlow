const { verifyAccessToken } = require('../utils/jwt');
const { ApiError } = require('../utils/asyncHandler');
const User = require('../models/User');

/**
 * Verifies JWT access token and attaches user to req.
 */
const protect = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError(401, 'Non authentifié : token manquant'));
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return next(new ApiError(401, 'Token invalide ou expiré'));
    }

    const user = await User.findById(decoded.userId);
    if (!user) return next(new ApiError(401, 'Utilisateur introuvable'));
    if (!user.isActive) return next(new ApiError(403, 'Compte désactivé'));

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Role-based access control.
 * Usage: router.get('/admin', protect, authorize('admin'), handler)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, 'Non authentifié'));
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, `Accès refusé. Rôle requis : ${allowedRoles.join(', ')}`));
    }
    next();
  };
};

module.exports = { protect, authorize };
