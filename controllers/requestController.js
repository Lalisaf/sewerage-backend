// controllers/requestController.js
const ServiceRequest = require("../models/ServiceRequest");

exports.createRequest = async (req, res) => {
  try {
    const { requester_id, location_lat, location_long, address, issue_type } = req.body;

    // Validate required fields
    if (!requester_id || !location_lat || !location_long || !address || !issue_type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newRequest = await ServiceRequest.create({
      requester_id,
      location_lat,
      location_long,
      address,
      issue_type,
    });

    res.status(201).json(newRequest);
  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).json({ error: "Failed to create request" });
  }
};