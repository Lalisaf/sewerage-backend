// Backend: controllers/requestController.js
exports.getAllRequests = async (req, res) => {
    try {
      const { urgency, location } = req.query;
      const whereClause = {};
      if (urgency) whereClause.urgency = urgency;
      if (location) whereClause.location = { [Sequelize.Op.iLike]: `%${location}%` };
  
      const requests = await Request.findAll({ where: whereClause });
      res.status(200).json(requests);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  exports.createRequest = async (req, res) => {
    try {
      const { location, problem, urgency } = req.body;
      const newRequest = await Request.create({ location, problem, urgency });
      res.status(201).json(newRequest);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };


  // backend/controllers/requestController.js
const db = require('../models');
const { Op } = require('sequelize');
//const ErrorResponse = require('../utils/errorResponse');
//const asyncHandler = require('../middlewares/async');

// @desc    Create new service request
// @route   POST /api/requests
// @access  Public
exports.createRequest = asyncHandler(async (req, res, next) => {
  const request = await db.Request.create({
    ...req.body,
    requesterId: req.user?.id || null
  });

  res.status(201).json({
    success: true,
    data: request
  });
});

// @desc    Get all service requests
// @route   GET /api/requests
// @access  Private/Admin
exports.getRequests = asyncHandler(async (req, res, next) => {
  const { status, problemType, from, to } = req.query;
  
  const where = {};
  
  if (status) where.status = status;
  if (problemType) where.problemType = problemType;
  
  if (from && to) {
    where.createdAt = {
      [Op.between]: [new Date(from), new Date(to)]
    };
  }

  const requests = await db.Request.findAll({
    where,
    include: [
      {
        model: db.User,
        as: 'requester',
        attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
      },
      {
        model: db.Vehicle,
        as: 'vehicle',
        include: [{
          model: db.User,
          as: 'driver',
          attributes: ['id', 'firstName', 'lastName', 'phone']
        }]
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests
  });
});

// @desc    Get requests near location (GIS query)
// @route   GET /api/requests/nearby
// @access  Private/Driver
exports.getNearbyRequests = asyncHandler(async (req, res, next) => {
  const { longitude, latitude, radius = 5000 } = req.query; // radius in meters
  
  if (!longitude || !latitude) {
    return next(new ErrorResponse('Please provide longitude and latitude', 400));
  }

  const requests = await db.Request.findAll({
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
    )),
    status: 'submitted'
  });

  res.status(200).json({
    success: true,
    count: requests.length,
    data: requests
  });
});

// @desc    Update request status
// @route   PUT /api/requests/:id/status
// @access  Private/Driver
exports.updateRequestStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  const request = await db.Request.findByPk(id);
  
  if (!request) {
    return next(new ErrorResponse(`Request not found with id ${id}`, 404));
  }

  request.status = status;
  await request.save();

  res.status(200).json({
    success: true,
    data: request
  });
});