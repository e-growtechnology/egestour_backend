import mongoose from "mongoose";

const TourSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    tourType: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    photo: { type: String, required: true },
    orientation: { type: String, required: true },
    extras: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const tourModel = mongoose.model("Tour", TourSchema);

export default tourModel;
