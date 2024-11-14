import auth from "../../middlewares/auth/auth.js";
import Commission from "../../models/Admins/Commissions.js";
import express from "express"
const router = express.Router()

export const getCommissions = async (req, res) => {
    try {
        const commissions = await Commission.find();
        const commision = commissions[0]
        res.status(200).json(commision);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const addCommission = async (req, res) => {
    const commission = new Commission({
        hotelCommission: req.body.hotelCommission,
        flightCommission: req.body.flightCommission
    });
    try {
        const newCommission = await commission.save();
        res.status(201).json(newCommission);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

export const updateCommission = async (req, res) => {
    try {
    const commission = await Commission.find();
    if (!commission) return res.status(404).json({ message: "Commission not found" });
    const {hotelCommission, flightCommission} = req.body

    
    const update = await Commission.findByIdAndUpdate(commission[0]._id,{
        hotelCommission: hotelCommission,
        flightCommission: flightCommission
    })
        res.status(201).json(update);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

router.get("/", getCommissions)
router.put("/", updateCommission)
router.post("/", addCommission)

export default router