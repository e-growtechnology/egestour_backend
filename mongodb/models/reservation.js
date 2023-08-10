import mongoose from "mongoose";

const ReservationSchema = new mongoose.Schema({
    user: {
        name: { type: String, required: true },
        contact: { type: String, required: true },
        email: { type: String, required: true },
    },
    companions: [{
        name: { type: String, required: true },
        contact: { type: String, required: true },
        email: { type: String, required: true },
    }],
    activity: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
    date: { type: Date, required: true },
    seats: { type: Number, required: true },
    confirmed: { type: Boolean, default: false },
    cancelationReason: { type: String },
}, { timestamps: true });

const reservationModel = mongoose.model("Reservation", ReservationSchema);

export default reservationModel;