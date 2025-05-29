import db from '../models/index.js'; // Correct the import path
const { VehicleHistory } = db; // Destructure the models
import {Op} from 'sequelize'; // Import Op for Sequelize operators

export const getHistory = async (req, res) => {
  try {
    const { vehicleId, days = 1 } = req.params;

    const history = await VehicleHistory.findAll({
      where: {
        vehicleId,
        timestamp: {
          [Op.gte]: new Date(new Date() - days * 24 * 60 * 60 * 1000)
        }
      },
      order: [['timestamp', 'ASC']],
      limit: 1000 // Prevent overloading
    });

    res.json(history.map(h => ({
      coordinates: h.location.coordinates,
      speed: h.speed,
      timestamp: h.timestamp
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
