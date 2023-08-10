import Agency from "../mongodb/models/agency.js";
import User from "../mongodb/models/user.js";

import mongoose from "mongoose";
import * as dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getAllAgencies = async (req, res) => {
    const {
        _end,
        _order,
        _start,
        _sort,
        name_like = "",
        identification = "",
    } = req.query;

    const query = {};

    if (identification !== "") {
        query.identification = identification;
    }

    if (name_like) {
        query.name = { $regex: name_like, $options: "i" };
    }

    try {
        const count = await Agency.countDocuments({ query });

        const agencies = await Agency.find(query)
            .limit(_end)
            .skip(_start)
            .sort({ [_sort]: _order });

        res.header("x-total-count", count);
        res.header("Access-Control-Expose-Headers", "x-total-count");

        res.status(200).json(agencies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAgencyDetail = async (req, res) => {
    const { id } = req.params;
    const agencyExists = await Agency.findOne({ _id: id }).populate(
        "creator",
    );

    if (agencyExists) {
        res.status(200).json(agencyExists);
    } else {
        res.status(404).json({ message: "Agency not found" });
    }
};

const createAgency = async (req, res) => {
    try {
        const {
            name,
            contact,
            location,
            operation,
            photo,
            identification,
        } = req.body;

        const session = await mongoose.startSession();
        session.startTransaction();

        const user = await User.findOne({ email }).session(session);

        if (!user) throw new Error("User not found");

        const photoUrl = await cloudinary.uploader.upload(photo);

        const newAgency = await Agency.create({
            name,
            contact,
            location,
            operation,
            photo: photoUrl.url,
            identification,
            creator: user._id,
        });

        user.allTours.push(newAgency._id);
        await user.save({ session });

        await session.commitTransaction();

        res.status(200).json({ message: "Agency created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateAgency = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contact, location, operation, photo, identification } =
            req.body;

        const photoUrl = await cloudinary.uploader.upload(photo);

        await Agency.findByIdAndUpdate(
            { _id: id },
            {
                name,
                contact,
                location,
                operation,
                photo: photoUrl.url || photo,
                identification,
            },
        );

        res.status(200).json({ message: "Agency updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAgency = async (req, res) => {
    try {
        const { id } = req.params;

        const agencyToDelete = await Agency.findById({ _id: id }).populate(
            "creator",
        );

        if (!agencyToDelete) throw new Error("Agency not found");

        const session = await mongoose.startSession();
        session.startTransaction();

        agencyToDelete.remove({ session });
        agencyToDelete.creator.allTours.pull(agencyToDelete);

        await agencyToDelete.creator.save({ session });
        await session.commitTransaction();

        res.status(200).json({ message: "Agency deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    getAllAgencies,
    getAgencyDetail,
    createAgency,
    updateAgency,
    deleteAgency,
};
