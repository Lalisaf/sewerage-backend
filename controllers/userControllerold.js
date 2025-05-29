//const {User} = require("../models");
import db from "../models/index.js";
const {User} = db;

// Get all users with sorting and filtering
export const getAllUsers = async (req, res) => {
  try {
    const { sortBy = "createdAt", order = "ASC", search = "" } = req.query;

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ],
      },
      order: [[sortBy, order]],
    });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create user
export const createUser = async (req, res) => {
  try {
    console.log("Received Request Body:", req.body);

    // Map request body to match Sequelize model field names
    const userData = {
      firstName: req.body.first_name,
      middleName: req.body.middle_name,
      lastName: req.body.last_name,
      username: req.body.username,
      email: req.body.email,
      country: req.body.country,
      region: req.body.region,
      city: req.body.city,
      subcity: req.body.subcity,
      phone_number: req.body.phone_number,
      role: req.body.role,
      status: req.body.status,
      password: req.body.password, // Will be hashed in model
    };

    // Create user
    const user = await User.create(userData);
    res.status(201).json(user);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(400).json({ error: err.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    await user.update(req.body);
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    await user.destroy();
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};