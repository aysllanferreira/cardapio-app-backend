/* eslint-disable consistent-return */
/* eslint-disable import/extensions */
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.js';

dotenv.config();

export const startSession = async (req, res) => {
  // get token from cookies
  const token = req.headers.authorization;
  const tokenx = token.split(' ')[1];

  // verify token
  const decoded = jwt.verify(tokenx, process.env.SECRET_KEY);

  try {
    // get user
    const user = await User.findById(decoded.id);
    const { _id, email, name } = user;
    const newUser = { _id, email, name };

    // send user
    res.status(200).json({ newUser, tokenx });
  } catch (errs) {
    res.status(500).json({ message: errs.message });
  }
};

export const logout = async (req, res) => {
  // delete token from cookies
  res.clearCookie('token');

  res.status(200).json({ message: 'User logged out' });
};
