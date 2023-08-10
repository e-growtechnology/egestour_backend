import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    preferences: { type: String, required: true },
    origin: { type: String, required: true },
    history: { type: String, required: false },
    activity: { type: String, required: false },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const clientModel = mongoose.model("Client", ClientSchema);

export default clientModel;