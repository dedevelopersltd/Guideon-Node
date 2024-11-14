import mongoose from "mongoose";

const CommissionSchema = new mongoose.Schema({
    hotelCommission : {
        type: Number,
        default: 0
    },
    flightCommission:{
        type: Number,
        default: 0
    }
},
{
    timestamps:true
})

const Commission = mongoose.model("Commission", CommissionSchema, "Commission");

export default Commission