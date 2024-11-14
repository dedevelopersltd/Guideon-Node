import mongoose from "mongoose"
const Schema = mongoose.Schema;

// Define the voucher schema
const voucherSchema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String, 
        required: true
    },
    description: {
        type: String,
        required: false
    },
    discount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    expirationDate: {
        type: Date,
        required: true
    },
    users :{
        type: Array,
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Create a model based on the schema
const Voucher = mongoose.model('Voucher', voucherSchema);

export default Voucher