import Voucher from "../../models/Admins/Vouchers.js";
import express from "express"
import auth from "../../middlewares/auth/auth.js";
const router = express.Router();

router.get("/",auth, async (req, res) => {
    try {
        const userId = req.user.userId
        const vouchers = await Voucher.find({ isActive: true });
        const filterConsumed = vouchers.filter((voucher) => !voucher.users.includes(userId));
        res.status(200).json(filterConsumed);
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err.message });
    }
});

router.post("/",auth, async (req, res) => {
    const voucher = new Voucher({
        code: req.body.code,
        name: req.body.name,
        description: req.body.description,  
        discount: req.body.discount,
        expirationDate: req.body.expirationDate,
        isActive: req.body.isActive
    });
    try {
        const newVoucher = await voucher.save();
        res.status(201).json(newVoucher);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const deletedVoucher = await Voucher.findByIdAndDelete(req.params.id);
        res.json(deletedVoucher);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}); 

router.put("/:id", async (req, res) => {
    try {
        const updatedVoucher = await Voucher.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedVoucher);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const voucher = await Voucher.findById(req.params.id);
        if (!voucher) return res.status(404).json({ message: "Voucher not found" });
        res.json(voucher);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


export default router