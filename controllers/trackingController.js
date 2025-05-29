import db from '../models/index.js'; // Correct the import path
const { Vehicle, Request, VehicleHistory } = db; // Destructure the models
import { Op } from 'sequelize'; // Import Op for Sequelize operators
import axios from 'axios'; // Import axios for HTTP requests

// Real-time tracking with ETA calculation
export  const trackVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    
    const vehicle = await Vehicle.findByPk(vehicleId, {
      include: [
        {
          model: Request,
          as: 'currentRequest',
          where: { status: 'assigned' },
          required: false
        }
      ]
    });

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Get route and ETA from mapping service (example with OpenStreetMap OSRM)
    if (vehicle.currentRequest && vehicle.currentLocation) {
      const originLon = vehicle.currentLocation.coordinates[0];
      const originLat = vehicle.currentLocation.coordinates[1];
      const destLon = vehicle.currentRequest.location.coordinates[0];
      const destLat = vehicle.currentRequest.location.coordinates[1];

      const url = `http://router.project-osrm.org/route/v1/driving/${originLon},${originLat};${destLon},${destLat}?overview=full&geometries=polyline`;

      const response = await axios.get(url);

      if (response.data.code !== 'Ok' || !response.data.routes || response.data.routes.length === 0) {
        return res.status(500).json({ message: 'Error fetching route from OSRM' });
      }

      const route = response.data.routes[0];
      const etaSeconds = route.duration;
      const distanceMeters = route.distance;

      // Convert ETA to human-readable format
      const etaMinutes = Math.round(etaSeconds / 60);
      const eta = etaMinutes > 60 ? 
        `${Math.floor(etaMinutes / 60)}h ${etaMinutes % 60}m` : 
        `${etaMinutes} mins`;

      // Return response similar to previous format
      return res.json({
        vehicle,
        route: {
          polyline: route.geometry,
          distance: `${(distanceMeters / 1000).toFixed(2)} km`,
          eta
        }
      });
    }

    res.json({ vehicle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controllers/trackingController.js
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


//for straight forward calculaation i can use this one 
/*
const { Vehicle, Request } = require('../models');
const turf = require('@turf/turf');

exports.trackVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    
    const vehicle = await Vehicle.findByPk(vehicleId, {
      include: [
        {
          model: Request,
          as: 'currentRequest',
          where: { status: 'assigned' },
          required: false
        }
      ]
    });

    if (!vehicle || !vehicle.currentLocation || !vehicle.currentRequest) {
      return res.json({ vehicle });
    }

    // Calculate straight-line distance and ETA (simplified without routing)
    const from = turf.point(vehicle.currentLocation.coordinates);
    const to = turf.point(vehicle.currentRequest.location.coordinates);
    const distance = turf.distance(from, to, { units: 'kilometers' });
    
    // Assume average speed of 30 km/h in urban areas
    const etaHours = distance / 30;
    const etaMinutes = Math.round(etaHours * 60);
    
    res.json({
      vehicle,
      route: {
        distance: `${distance.toFixed(1)} km`,
        eta: etaMinutes > 0 ? `${etaMinutes} mins` : 'Arrived'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
*/