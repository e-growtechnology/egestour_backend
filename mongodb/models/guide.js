import mongoose from "mongoose";

const GuideSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contact: { type: String, required: true },
    location: { type: String, required: true },
    commission: { type: Number, required: true },
    workinghours: { type: String, required: true },
    photo: { type: String, required: true },
    language: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const guideModel = mongoose.model("Guide", GuideSchema);

export default guideModel;