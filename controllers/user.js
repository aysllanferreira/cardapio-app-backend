/* eslint-disable no-underscore-dangle */
/* eslint-disable import/extensions */
/* eslint-disable consistent-return */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import User, { validateUser } from '../models/user.js';

dotenv.config();

const sendEmail = (email, token) => {
  // send email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GM_EMAIL,
      pass: process.env.GM_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GM_EMAIL,
    to: email,
    subject: 'Activate your account',
    html: `<h1>Click the link to activate your account</h1>
    <a href="http://localhost:5173/activate?token=${token}">Activate</a>`,
  };

  transporter.sendMail(mailOptions, (e, info) => {
    if (e) {
      console.log(e);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
};

const forgotPassEmail = (email, token) => {
  // send email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GM_EMAIL,
      pass: process.env.GM_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.GM_EMAIL,
    to: email,
    subject: 'Reset your password',
    html: `<h1>Click the link to reset your password</h1>
    <a href="http://localhost:5173/pass-recover?token=${token}">Reset</a>`,
  };

  transporter.sendMail(mailOptions, (e, info) => {
    if (e) {
      console.log(e);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
};

export const registerUser = async (req, res) => {
  const {
    name, email, password,
  } = req.body;

  // Validate user
  const { error } = validateUser(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  // Verify name and email exists
  const emailExists = await User.findOne({ email });
  const nameExists = await User.findOne({ name });

  if (emailExists) return res.status(400).json({ message: 'Email already exists' });
  if (nameExists) return res.status(400).json({ message: 'Name already exists' });

  // Generate hashed password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    active: false,
  });

  try {
    // Save new user
    await newUser.save();

    // Generate token
    const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY, { expiresIn: '720h' });

    // Send email
    sendEmail(email, token);

    // Send token
    res.status(200).json({ token });
  } catch (errs) {
    res.status(500).json({ message: errs.message });
  }
};

export const activateUser = async (req, res) => {
  const { token } = req.params;

  // Verify token
  const decoded = jwt.verify(token, process.env.SECRET_KEY);

  // Verify user
  const user = await User.findById(decoded.id);

  if (!user) return res.status(400).json({ message: 'User does not exist' });

  // Verify user already activated
  if (user.active) return res.status(400).json({ message: 'User already activated' });

  // Activate user
  user.active = true;

  try {
    // Save user
    await user.save();

    res.status(200).json({ message: 'User activated' });
  } catch (errs) {
    res.status(500).json({ message: errs.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const name = email;

  // Validate user
  if (!name && !email) return res.status(400).json({ message: 'Name or email is required' });
  if (!password) return res.status(400).json({ message: 'Password is required' });

  // Verify email or name exists
  const emailExists = await User.findOne({ email });
  const nameExists = await User.findOne({ name });

  if (!emailExists && !nameExists) {
    return res.status(400).json({ message: 'User does not exist' });
  }

  try {
    // Compare password
    let passToCompare;
    if (emailExists) passToCompare = emailExists.password;
    else if (nameExists) passToCompare = nameExists.password;
    else return res.status(400).json({ message: 'Login or Password is wrong.' });

    const isPasswordCorrect = await bcrypt.compare(password, passToCompare);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Login or Password is wrong.' });
    }

    // Verify user is active
    const user = emailExists || nameExists;
    if (!user.active) {
      return res.status(400).json({ message: 'User is not active' });
    }

    // Send token
    const tokenx = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '24h' });

    // Save cookies expires in 24h
    res.cookie('token', tokenx, { httpOnly: true }, { maxAge: 24 * 60 * 60 * 1000 }, { secure: true });

    res.status(200).json({ message: 'User logged!', tokenx });
  } catch (errors) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const resendEmail = async (req, res) => {
  const { email } = req.body;
  const name = email;

  if (!email && !name) return res.status(400).json({ message: 'Email or name is required' });

  // Verify email or username exists
  const emailExists = await User.findOne({ email });
  const nameExists = await User.findOne({ name });

  if (!emailExists && !nameExists) {
    return res.status(400).json({ message: 'User does not exist' });
  }

  // Verify user is active
  const user = emailExists || nameExists;
  if (user.active) {
    return res.status(400).json({ message: 'User is already active' });
  }

  // Generate token
  const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '720h' });

  try {
    // Send email
    sendEmail(user.email, token);

    res.status(200).json({ message: 'Email sent' });
  } catch (errs) {
    res.status(500).json({ message: errs.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const name = email;

  const emailExists = await User.findOne({ email });
  const nameExists = await User.findOne({ name });

  if (!emailExists && !nameExists) {
    return res.status(400).json({ message: 'User does not exist' });
  }

  let user;
  if (emailExists !== null) user = emailExists;
  else if (nameExists !== null) user = nameExists;

  // Generate token
  const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '12h' });

  try {
    // Send email
    forgotPassEmail(user.email, token);

    res.status(200).json({ message: 'Email sent' });
  } catch (errs) {
    res.status(500).json({ message: errs.message });
  }
};

const checkResetPassword = async (token) => {
  // decode token
  const decoded = jwt.verify(token, process.env.SECRET_KEY);

  // Verify user
  const user = await User.findById(decoded.id);
  if (!user) return false;
  return true;
};

export const resetPassExecution = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // check if token is valid
  const verifyToken = await checkResetPassword(token);

  if (!verifyToken) return res.status(400).json({ message: 'Invalid token' });

  // decode token
  const decoded = jwt.verify(token, process.env.SECRET_KEY);

  // Verify user
  const user = await User.findById(decoded.id);

  // Verify if passwords still the same
  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (isPasswordCorrect) {
    return res.status(400).json({ message: 'Password is the same, choose another one or logIn.' });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Update password
  user.password = hashedPassword;

  try {
    // Save user
    await user.save();

    res.status(200).json({ message: 'Password changed' });
  } catch (errs) {
    res.status(500).json({ message: errs.message });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;

  // decode token
  const verifyToken = await checkResetPassword(token);

  if (!verifyToken) return res.status(400).json({ message: 'Invalid token' });

  res.status(200).json({ message: 'Token verified' });
};

export const rememberMeButton = async (req, res) => {
  const {
    checked, name, email, password,
  } = req.body;

  if (!name) return res.status(400).json({ message: 'Name is required' });
  if (!email) return res.status(400).json({ message: 'Email is required' });
  if (!password) return res.status(400).json({ message: 'Password is required' });
  const login = name || email;

  if (checked) {
    // Save cookies name or email for 30 days
    res.cookie('login', login, { maxAge: 2592000000 });
    res.cookie('rememberMe', checked, { maxAge: 2592000000 });
  } else {
    // Delete cookies
    res.clearCookie('login');
    res.clearCookie('rememberMe');
  }
};
