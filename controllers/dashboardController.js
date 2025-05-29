// controllers/dashboardController.js

import { Op, Sequelize } from 'sequelize';
import db from '../models/index.js';

const { Vehicle, Request } = db;

// GET /api/dashboard/kpis
export const getKPIs = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalVehicles, availableVehicles, activeRequests, completedToday] = await Promise.all([
      Vehicle.count(),
      Vehicle.count({ where: { status: 'available' } }),
      Request.count({ where: { status: 'in_progress' } }),
      Request.count({
        where: {
          status: 'completed',
          updated_at: { [Op.gte]: startOfDay }
        }
      })
    ]);

    // Average response time in minutes for today's completed requests
    const avgResponseResult = await Request.findOne({
      attributes: [
        [Sequelize.fn('AVG', Sequelize.literal('EXTRACT(EPOCH FROM ("updated_at" - "created_at")) / 60')), 'avgResponse']
      ],
      where: {
        status: 'completed',
        updated_at: { [Op.gte]: startOfDay }
      },
      raw: true
    });

    res.json({
      totalVehicles,
      availableVehicles,
      activeRequests,
      completedToday,
      avgResponseTime: parseFloat(avgResponseResult.avgResponse) || 0
    });

  } catch (error) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({ message: 'An error occurred while fetching KPIs.', error: error.message });
  }
};

export const getGISData = async (req, res) => {
  try {
    const [vehicles, requests] = await Promise.all([
      Vehicle.findAll({
        attributes: ['vehicle_id', 'plateNumber', 'status', 'location'],
        where: {
          location: { [Op.ne]: null }
        }
      }),
      Request.findAll({
        where: {
          status: { [Op.not]: 'completed' }
        },
        attributes: ['request_id', 'problemType', 'urgency', 'location']
      })
    ]);

    res.json({
      vehicles: vehicles.map(v => ({
        vehicle_id: v.vehicle_id,
        plateNumber: v.plateNumber,
        status: v.status,
        coordinates: v.location?.coordinates || null
      })),
      requests: requests.map(r => ({
        request_id: r.request_id,
        problemType: r.problemType,
        urgency: r.urgency,
        coordinates: r.location?.coordinates || null
      }))
    });

  } catch (error) {
    console.error('Error fetching GIS data:', error);
    res.status(500).json({ message: 'An error occurred while fetching GIS data.', error: error.message });
  }
};
