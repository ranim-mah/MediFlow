const express = require('express');
const { body } = require('express-validator');
const { register, login, refresh, logout, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

const registerValidators = [
  body('fullName').trim().isLength({ min: 2 }).withMessage('Nom complet requis (min 2 car.)'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe : 6 caractères minimum'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email invalide'),
  body('phone').optional({ checkFalsy: true }).isString(),
];

router.post('/register', registerValidators, register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, me);

module.exports = router;
