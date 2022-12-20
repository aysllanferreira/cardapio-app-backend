/* eslint-disable import/extensions */
import express from 'express';
import {
  registerUser, loginUser, activateUser, resendEmail, forgotPassword,
  resetPassword, resetPassExecution, rememberMeButton,
} from '../controllers/user.js';
import { startSession, logout } from '../controllers/session.js';

const router = express.Router();

router.get('/activate/:token', activateUser);
router.get('/reset/:token', resetPassword);

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/resend', resendEmail);
router.post('/forgot', forgotPassword);
router.post('/reset/:token', resetPassExecution);
router.post('/remember', rememberMeButton);
router.get('/session', startSession);
router.get('/logout', logout);

export default router;
