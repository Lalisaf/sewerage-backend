// controllers/authController.js
import db from '../models/index.js';
const { User } = db;
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../utils/email/index.js';
import { Op } from 'sequelize'; // ➔ Needed for Op.gt in verifyAccount

export const registerUser = async (req, res) => {
  try {
    const { 
      firstName, middleName, lastName, username, password, role, 
      email, country, region, city, subcity, phone_number 
    } = req.body;

    const user = await User.create({ 
      firstName, middleName, lastName, username, password, role, 
      email, country, region, city, subcity, phone_number 
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.user_id,
        email: user.email,
        firstName: user.firstName,
        middleName: user.middleName,
        lastName: user.lastName,
        role: user.role,
        phone_number: user.phone_number,
        status: user.status,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const requestVerification = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    // Prevent spamming
    if (user.lastVerificationAttempt && Date.now() - user.lastVerificationAttempt < 60000) {
      return res.status(429).json({ 
        message: 'Please wait 1 minute before requesting another verification' 
      });
    }

    const token = user.generateVerificationToken();
    user.lastVerificationAttempt = Date.now();
    await user.save();

    await sendVerificationEmail(user.email, token);

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyAccount = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      where: {
        verificationToken: token,
        verificationTokenExpires: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    res.json({ message: 'Account verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyToken = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
      token: req.token
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

export const getUserFromToken = async (req, res) => {
  try {
    res.status(200).json({ user: req.user, token: req.token });
  } catch (err) {
    console.error('Error getting user from token:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
