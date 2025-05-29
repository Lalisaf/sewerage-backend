import db from '../models/index.js';
const { Request, User, Vehicle } =db;
import { Op, Sequelize } from 'sequelize';
import sequelize from '../models/index.js'; // Added to fix "sequelize.where" usage

// @desc    Create new service request
// @route   POST /api/requests
// @access  Public
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure upload directory
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export const createRequest = async (req, res) => {
  try {
    // Handle both form-data and JSON
    const { problemType, description, urgency, location, requester_id } = req.body;
    const files = req.files || [];

    // Validate required fields
    if (!problemType || !description || !location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: {
          problemType: !problemType ? 'Missing' : 'Valid',
          description: !description ? 'Missing' : 'Valid',
          location: !location ? 'Missing' : 'Valid'
        }
      });
    }

    // Parse location data
    let locationData;
    try {
      locationData = typeof location === 'string' ? JSON.parse(location) : location;
      
      // Validate GeoJSON format
      if (!locationData.type || !locationData.coordinates || !Array.isArray(locationData.coordinates)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid location format',
          expected: {
            type: 'Point',
            coordinates: [longitude, latitude] // GeoJSON order
          }
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: 'Invalid location data',
        details: err.message
      });
    }

    // Process uploaded images
    const imageUrls = files.map(file => `/uploads/${file.filename}`);
    /*const imageUrls = [];
    for (const file of files) {
      // Use the filename multer already assigned
      imageUrls.push(`../public/uploads/${file.filename}`);
    }*/

    // Create the request with proper geometry
    const newRequest = await Request.create({
      problemType,
      description,
      urgency: urgency || 'medium',
      images: imageUrls,
      location: db.sequelize.fn('ST_GeomFromGeoJSON', JSON.stringify({
        type: 'Point',
        coordinates: locationData.coordinates,
        crs: { type: 'name', properties: { name: 'EPSG:4326' } }
      })),
      requesterId: requester_id,
      requester_id: requester_id,
      status: 'submitted'
    });

    // Automatically assign vehicle if possible
    const assignmentResult = await autoAssignVehicle(newRequest);
    
    
    // Prepare response
    const responseData ={
      ...newRequest.toJSON(),
      vehicle: assignmentResult?.vehicle || null,
    }
    // Notify requester
    if (assignmentResult?.vehicle) {
      responseData.status = 'assigned';
      await newRequest.update({ status: 'assigned' });
    }
    res.status(201).json({
      success: true,
      data: newRequest
    });
  } catch (err) {
    console.error('Error creating request:', err);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error'
    });
  }
};

// Auto-assign vehicle logic
const autoAssignVehicle = async (request) => {
  try {
    // Find available vehicles that can handle this problem type
    // and are within 20km radius, ordered by distance
    const vehicles = await Vehicle.findAll({
      where: {
        status: 'available',
        capabilities: { [Op.contains]: [request.problemType] }
      },
      order: [
        db.sequelize.literal(`
          ST_Distance(
            location,
            ST_GeomFromGeoJSON('${JSON.stringify(request.location)}')
          )
        `)
      ],
      limit: 1
    });

    if (vehicles.length > 0) {
      const vehicle = vehicles[0];
      
      // Update request with assigned vehicle
      await request.update({
        vehicleId: vehicle.vehicle_id,
        status: 'assigned'
      });

      // Update vehicle status
      await vehicle.update({ status: 'in_service' });
        notifyUser(request.user_id,"Thank you! for you have submit your request and we have assign you a vehcle for your request");
      return { vehicle };
    }
    return null;
  } catch (err) {
    console.error('Auto-assignment error:', err);
    return null;
  }
};

// Notification helper
const notifyUser = async (userId, notificationData) => {
  try {
    // Save to database
    const notification = await Notification.create({
      userId,
      ...notificationData,
      read: false
    });

    // Send real-time push notification
    const user = await User.findByPk(userId);
    if (user.pushToken) {
      await sendPushNotification(user.pushToken, notificationData);
    }

    return notification;
  } catch (err) {
    console.error('Error sending notification:', err);
  }
};
export const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await Request.findByPk(id);

    if (!request) {
      return res.status(404).json({ error: `Request not found with id ${id}` });
    }

    await request.destroy();

    res.status(200).json({
      success: true,
      message: `Request with id ${id} deleted successfully`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get all requests (with filters and pagination)
// @route   GET /api/requests
// @access  Private (Admin/Operator see all, Users see their own)
export const getRequests = async (req, res) => {
  try {
    const { status, problemType, from, to, urgency, page = 1, limit = 10 } = req.query;
    const whereClause = {};
    const offset = (page - 1) * limit;

    // Apply filters
    if (status) whereClause.status = status;
    if (problemType) whereClause.problemType = problemType;
    if (urgency) whereClause.urgency = urgency;
    if (from && to) {
      whereClause.createdAt = { [Op.between]: [new Date(from), new Date(to)] };
    }

    // Regular users can only see their own requests
    if (req.user.role === 'user') {
      whereClause.requesterId = req.user.user_id;
    }

    const { count, rows: requests } = await Request.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: User, 
          as: 'requester',
          attributes: ['user_id', 'firstName', 'lastName', 'phone']
        },
        { 
          model: Vehicle,
          as: 'vehicle',
          attributes: ['vehicle_id', 'plateNumber', 'model']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: +limit,
      offset: +offset,
      distinct: true // Important for correct counting with includes
    });

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: +page,
      data: requests
    });
  } catch (err) {
    console.error("Error in getRequests:", err);
    res.status(500).json({ 
      success: false,
      error: "Internal Server Error",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// @desc    Get single service request with detailed info
// @route   GET /api/requests/:id
// @access  Private (Admin/Operator see all, Users see their own)
export const getRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const whereClause = { request_id: id };

    // Regular users can only access their own requests
    if (req.user.role === 'user') {
      whereClause.requesterId = req.user.user_id;
    }

    const request = await Request.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['user_id', 'firstName', 'lastName', 'phone', 'email']
        },
        {
          model: Vehicle,
          as: 'vehicle',
          include: [{
            model: User,
            as: 'driver',
            attributes: ['user_id', 'firstName', 'lastName', 'phone']
          }]
        }
      ]
    });

    if (!request) {
      return res.status(404).json({ 
        success: false,
        error: 'Request not found or unauthorized access'
      });
    }

    // Transform location data for frontend
    const requestData = request.toJSON();
    if (requestData.location) {
      const point = await db.sequelize.query(
        `SELECT ST_X(location::geometry) as longitude, ST_Y(location::geometry) as latitude 
         FROM requests WHERE request_id = ?`,
        { replacements: [id], type: db.sequelize.QueryTypes.SELECT }
      );
      requestData.coordinates = point[0];
    }

    res.status(200).json({
      success: true,
      data: requestData
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// @desc    Update service request (status, assigned vehicle, etc.)
// @route   PUT /api/requests/:id
// @access  Private/Admin or Operator

export const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, vehicleId, urgency, problemType, description, location, requester_id } = req.body;
    const files = req.files || [];

    const request = await Request.findByPk(id);
    if (!request) {
      return res.status(404).json({ 
        success: false,
        error: `Request not found with id ${id}` 
      });
    }

    // Only allow status changes for drivers
    if (req.user.role === 'driver' && status) {
      request.status = status;
    } 
    // Admin/Operator can update more fields
    else if (['admin', 'operator'].includes(req.user.role)) {
      if (status) request.status = status;
      if (vehicleId) request.vehicleId = vehicleId;
      if (urgency) request.urgency = urgency;
      if (problemType) request.problemType = problemType;
      if (description) request.description = description;

      if (location) {
        let locationData;
        try {
          locationData = typeof location === 'string' ? JSON.parse(location) : location;
          if (!locationData.type || !locationData.coordinates || !Array.isArray(locationData.coordinates)) {
            return res.status(400).json({
              success: false,
              error: 'Invalid location format',
              expected: {
                type: 'Point',
                coordinates: [longitude, latitude]
              }
            });
          }
          request.location = db.sequelize.fn('ST_GeomFromGeoJSON', JSON.stringify({
            type: 'Point',
            coordinates: locationData.coordinates,
            crs: { type: 'name', properties: { name: 'EPSG:4326' } }
          }));
        } catch (err) {
          return res.status(400).json({
            success: false,
            error: 'Invalid location data',
            details: err.message
          });
        }
      }

      // Process uploaded images if any
      if (files.length > 0) {
        const imageUrls = files.map(file => `/uploads/${file.filename}`);
        request.images = imageUrls;
      }
    }

    await request.save();

    // Return updated request with associations
    const updatedRequest = await Request.findByPk(id, {
      include: [
        { model: User, as: 'requester' },
        { model: Vehicle, as: 'vehicle' }
      ]
    });

    res.status(200).json({
      success: true,
      data: updatedRequest
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

// @desc    Get requests near location (GIS query)
// @route   GET /api/requests/nearby
// @access  Private/Driver
export const getNearbyRequests = async (req, res) => {
  try {
    const { longitude, latitude, radius = 5000 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({ 
        success: false,
        error: 'Please provide longitude and latitude' 
      });
    }

    const requests = await Request.findAll({
      where: db.sequelize.where(
        db.sequelize.fn(
          'ST_DWithin',
          db.sequelize.col('location'),
          db.sequelize.fn(
            'ST_MakePoint',
            parseFloat(longitude),
            parseFloat(latitude)
          ),
          parseInt(radius)
        ),
        true
      ),
      include: [
        { model: User, as: 'requester' }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Add distance to each request
    const requestsWithDistance = await Promise.all(requests.map(async request => {
      const result = await db.sequelize.query(
        `SELECT ST_Distance(location, ST_MakePoint(?, ?)::geography) as distance
         FROM requests WHERE request_id = ?`,
        { 
          replacements: [longitude, latitude, request.request_id],
          type: db.sequelize.QueryTypes.SELECT 
        }
      );
      
      return {
        ...request.toJSON(),
        distance: result[0].distance
      };
    }));

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requestsWithDistance
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};
// @desc    Update request status
// @route   PUT /api/requests/:id/status
// @access  Private/Driver
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const request = await Request.findByPk(id);
    if (!request) {
      return res.status(404).json({ error: `Request not found with id ${id}` });
    }

    request.status = status;
    await request.save();

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const whereClause = {};
    if (startDate && endDate) {
      whereClause.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const totalRequests = await Request.count({ where: whereClause });
    const completedRequests = await Request.count({
      where: { ...whereClause, status: 'completed' }
    });
    const pendingRequests = await Request.count({
      where: { ...whereClause, status: 'pending' }
    });

    res.status(200).json({
      success: true,
      data: {
        totalRequests,
        completedRequests,
        pendingRequests
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}