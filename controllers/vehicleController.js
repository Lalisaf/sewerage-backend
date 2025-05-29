// controllers/vehicleController.js
import db from '../models/index.js';
import { Op, where } from 'sequelize';
const { Vehicle, User } = db;

export const createVehicle = async (req, res) => {
  try {
    console.log('Incoming payload:', req.body);
    const { plateNumber, vehicleType, driverId, model, ownership, capabilities, location } = req.body;
    
    if (!plateNumber || !vehicleType || !model) {
      console.log('Missing required fields:', { plateNumber, vehicleType, model });
      return res.status(400).json({ 
        error: 'Missing required fields: plateNumber, vehicleType, model' 
      });
    }
    const vehicle = await Vehicle.create({
      plateNumber,
      vehicleType,
      model,
      capabilities,
      ownership,
      location,
      status: 'available',
      driverId: driverId || null,
    });

    res.status(201).json(vehicle);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'License plate already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

export const getAllVehicles = async (req, res) => {
  try {
    const { status, type, ownership } = req.query;
    const where = {};
    
    if (status) where.status = status;
    if (type) where.vehicleType = type;
    if (ownership) where.ownership = ownership;

    const vehicles = await Vehicle.findAll({
      where,
      include: [{
        model: User,
        as: 'driver',
        attributes: ['user_id', 'firstName', 'lastName', 'phone']
      }],
      order: [['createdAt', 'DESC']]
    });
    console.log('Vehicles:', vehicles);
    res.json(vehicles);
  } catch (error) {
    console.error('Error in getAllVehicles:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'driver',
        attributes: ['user_id', 'firstName', 'lastName', 'phone']
      }]
    });
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const [updated] = await Vehicle.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (!updated) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    const updatedVehicle = await Vehicle.findByPk(req.params.id);
    res.json(updatedVehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const deleted = await Vehicle.destroy({
      where: { id: req.params.id }
    });
    
    if (!deleted) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAvailableDrivers = async (req, res) => {
  try {
    const assignedDriver= await Vehicle.findAll({
      attributes: ['driverId'],
      where: {
        driverId: {[Op.ne]:null},
      },
    });
    const assignedDriverId= assignedDriver.map(v => v.driverId);
    const drivers = await User.findAll({
      where: { role: 'driver',
        user_id: {[Op.notIn]:assignedDriverId},
       },
      attributes: ['user_id', 'firstName', 'lastName', 'phone']
    });
    
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getAvailableVihicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({
      where: { status: 'available' },
      include: [{
        model: User,
        as: 'driver',
        attributes: ['user_id', 'firstName', 'lastName', 'phone']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(vehicles);
  } catch (error) {
    console.error('Error in getAvailableVehicles:', error);
    res.status(500).json({ error: error.message });
  }
}

export const AssignDriver = async (req, res) => {
  try {
    if (!req.body.driverId) {
      return res.status(400).json({ error: 'Driver ID is required' });
    }
    const { driverId } = req.body;
    const vehicle = await Vehicle.findByPk(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    vehicle.driverId = driverId;
    vehicle.status = 'assigned';
    await vehicle.save();
    
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const UnassignDriver = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByPk(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    vehicle.driverId = null;
    vehicle.status = 'available';
    await vehicle.save();
    
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};