const { validationResult } = require('express-validator');
const { nanoid } = require('nanoid');
const User = require('../models/User');
const Patient = require('../models/Patient');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { asyncHandler, ApiError } = require('../utils/asyncHandler');
const { ROLES } = require('../utils/constants');
const { createNotificationAndPush } = require('../services/notificationService');

/**
 * Helper: build token pair and persist refresh token on the user.
 */
const issueTokens = async (user) => {
  const payload = { userId: user._id.toString(), role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push({ token: refreshToken });
  // Keep only the last 5 sessions to avoid unbounded growth
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }
  user.lastLoginAt = new Date();
  await user.save();

  return { accessToken, refreshToken };
};

/**
 * POST /api/auth/register
 * Public registration (creates a patient account by default).
 */
exports.register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, 'Erreur de validation', errors.array());

  const { fullName, email, phone, password, preferredLanguage } = req.body;

  if (!email && !phone) {
    throw new ApiError(400, 'Email ou téléphone requis');
  }

  // Check duplicates
  const existing = await User.findOne({ $or: [{ email: email || null }, { phone: phone || null }] });
  if (existing) throw new ApiError(409, 'Un compte existe déjà avec cet email ou téléphone');

  // Create User
  const user = await User.create({
    fullName,
    email,
    phone,
    password,
    role: ROLES.PATIENT,
    preferredLanguage: preferredLanguage || 'ar',
  });

  // Create the linked patient record
  const patientCode = `P${Date.now().toString().slice(-6)}${nanoid(3).toUpperCase()}`;
  await Patient.create({
    userId: user._id,
    patientCode,
    fullName,
    phone: phone || '',
    email,
  });

  const { accessToken, refreshToken } = await issueTokens(user);

  res.status(201).json({
    success: true,
    message: 'Compte créé avec succès',
    data: { user, accessToken, refreshToken },
  });
});

/**
 * POST /api/auth/login
 * Accepts { identifier, password } — identifier = email OR phone.
 */
exports.login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) throw new ApiError(400, 'Identifiant et mot de passe requis');

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
  }).select('+password');

  if (!user) throw new ApiError(401, 'Identifiants invalides');
  if (!user.isActive) throw new ApiError(403, 'Compte désactivé');

  const match = await user.comparePassword(password);
  if (!match) throw new ApiError(401, 'Identifiants invalides');

  const { accessToken, refreshToken } = await issueTokens(user);

  res.json({
    success: true,
    message: 'Connexion réussie',
    data: { user, accessToken, refreshToken },
  });
});

/**
 * POST /api/auth/refresh
 * Exchange a refresh token for a new access token.
 */
exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, 'Refresh token requis');

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw new ApiError(401, 'Refresh token invalide ou expiré');
  }

  const user = await User.findById(decoded.userId);
  if (!user) throw new ApiError(401, 'Utilisateur introuvable');

  const tokenExists = user.refreshTokens?.some((t) => t.token === refreshToken);
  if (!tokenExists) throw new ApiError(401, 'Refresh token révoqué');

  const payload = { userId: user._id.toString(), role: user.role };
  const accessToken = generateAccessToken(payload);

  res.json({ success: true, data: { accessToken } });
});

/**
 * POST /api/auth/logout
 * Revokes the presented refresh token.
 */
exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken && req.user) {
    req.user.refreshTokens = (req.user.refreshTokens || []).filter((t) => t.token !== refreshToken);
    await req.user.save();
  }
  res.json({ success: true, message: 'Déconnexion réussie' });
});

/**
 * GET /api/auth/me
 * Returns the authenticated user profile + linked patient/doctor/staff data.
 */
exports.me = asyncHandler(async (req, res) => {
  const user = req.user;
  let profile = null;

  if (user.role === ROLES.PATIENT) {
    profile = await Patient.findOne({ userId: user._id });
  }
  // Doctor / Staff profiles can be added later with populate

  res.json({ success: true, data: { user, profile } });
});

/**
 * POST /api/auth/device-token
 * Register or refresh a mobile push token for the authenticated user.
 */
exports.registerDeviceToken = asyncHandler(async (req, res) => {
  const { token, platform } = req.body || {};

  if (!token || typeof token !== 'string') {
    throw new ApiError(400, 'Token push requis');
  }

  const cleanedToken = token.trim();
  if (!cleanedToken) {
    throw new ApiError(400, 'Token push requis');
  }

  req.user.pushTokens = Array.isArray(req.user.pushTokens) ? req.user.pushTokens : [];

  const existing = req.user.pushTokens.find((entry) => entry.token === cleanedToken);
  if (existing) {
    existing.platform = platform || existing.platform || 'unknown';
    existing.lastSeenAt = new Date();
  } else {
    req.user.pushTokens.push({
      token: cleanedToken,
      platform: platform || 'unknown',
      lastSeenAt: new Date(),
      createdAt: new Date(),
    });
  }

  await req.user.save();

  res.json({
    success: true,
    message: 'Token push enregistre',
    data: {
      token: cleanedToken,
      platform: platform || 'unknown',
    },
  });
});

/**
 * POST /api/auth/push-test
 * Sends a test push to the authenticated user.
 */
exports.sendTestPush = asyncHandler(async (req, res) => {
  const { title, body } = req.body || {};

  const result = await createNotificationAndPush({
    userId: req.user._id,
    type: 'system',
    title: String(title || 'Test notification Mediflow'),
    body: String(body || 'Ceci est un test push depuis Mediflow.'),
    link: '/patient/notifications',
    priority: 'normal',
    channels: ['in_app', 'push'],
  });

  res.json({
    success: true,
    message: 'Test push envoye',
    data: {
      notificationId: result.notification?._id,
      pushResult: result.pushResult,
    },
  });
});
