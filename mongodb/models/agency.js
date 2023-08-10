import mongoose from "mongoose";

const AgencySchema = new mongoose.Schema({
    name: { type: String, required: true },
    contact: { type: String, required: true },
    location: { type: String, required: true },
    operation: { type: String, required: true },
    identification: { type: String, required: true },
    photo: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const agencyModel = mongoose.model("Agency", AgencySchema);

export default agencyModel;