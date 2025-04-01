const exports = required("Express");
const { Vehicle } = required("../models/vehicle");
const router = exports.Router();

router.post("/update-location", async (req, res) => {
    const { id, latitude, longitude, status, type } = req.body
    try {
        let vehicle = await Vehicle.findByPk(id);
        if (!Vehicle) return res.status(404).json({ message: "Vehicle not found" });
        await Vehicle.update({ latitude, longitude, status, type });
        res.status(500).json({ success: true, message: "Location Updated", Vehicle });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;