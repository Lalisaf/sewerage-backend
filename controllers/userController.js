import db from '../models/index.js'; // Correct the import path
const { User } = db; // Destructure the models
import { Op } from 'sequelize'; // Impor
import bcrypt from 'bcrypt';

export const getAllUsers = async (req, res) => {
  try {
    const { role, status, isVerified, search, page = 1, limit = 10 } = req.query;
    
    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (isVerified) where.isVerified = isVerified === 'true';
    
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        {middleName: {[Op.iLike]:`%${search}%`}},
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    
    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['password', 'verificationToken', 'verificationTokenExpires'] },
      order: [['created_at', 'DESC']]
    });

    res.json({
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      data: users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'verificationToken', 'verificationTokenExpires'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const userData = req.body;
    
    // Validate required fields
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.create(userData);
    res.status(201).json({
      ...user.get(),
      password: undefined // Exclude password from response
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const [updated] = await User.update(req.body, {
      where: { user_id: req.params.id },
      individualHooks: true // For password hashing
    });
    
    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const updatedUser = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'verificationToken', 'verificationTokenExpires'] }
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.destroy({
      where: { user_id: req.params.id }
    });
    
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isVerified = true;
    await user.save();
    
    res.json({ message: 'User verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updateUserStatus = async (req, res) => {
  try {
    const { status, role } = req.body;
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.status = status;
    user.role = role;
    if (status === 'inactive') {
      user.isVerified = false; // Set isVerified to false if status is inactive
    }
    await user.save();
    
    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}