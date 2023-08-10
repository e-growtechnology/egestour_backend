import Guide from "../mongodb/models/guide.js";
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

const getAllGuides = async (req, res) => {
    const {
        _end,
        _order,
        _start,
        _sort,
        name_like = "",
        location = "",
    } = req.query;

    const query = {};

    if (location !== "") {
        query.location = location;
    }

    if (name_like) {
        query.name = { $regex: name_like, $options: "i" };
    }

    try {
        const count = await Guide.countDocuments({ query });

        const guides = await Guide.find(query)
            .limit(_end)
            .skip(_start)
            .sort({ [_sort]: _order });

        res.header("x-total-count", count);
        res.header("Access-Control-Expose-Headers", "x-total-count");

        res.status(200).json(guides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getGuideDetail = async (req, res) => {
    const { id } = req.params;
    const guideExists = await Guide.findOne({ _id: id }).populate(
        "creator",
    );

    if (guideExists) {
        res.status(200).json(guideExists);
    } else {
        res.status(404).json({ message: "Guide not found" });
    }
};

const createGuide = async (req, res) => {
    try {
        const {
            name,
            contact,
            location,
            commission,
            workinghours,
            photo,
            language,
        } = req.body;

        const session = await mongoose.startSession();
        session.startTransaction();

        const user = await User.findOne({ email }).session(session);

        if (!user) throw new Error("User not found");

        const photoUrl = await cloudinary.uploader.upload(photo);

        const newGuide = await Guide.create({
            name,
            contact,
            location,
            commission,
            workinghours,
            photo: photoUrl.url,
            language,
            creator: user._id,
        });

        user.allTours.push(newGuide._id);
        await user.save({ session });

        await session.commitTransaction();

        res.status(200).json({ message: "Guide created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateGuide = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contact, location, commission, workinghours, photo, language } =
            req.body;

        const photoUrl = await cloudinary.uploader.upload(photo);

        await Guide.findByIdAndUpdate(
            { _id: id },
            {
                name,
                contact,
                location,
                commission,
                workinghours,
                photo: photoUrl.url || photo,
                language,
            },
        );

        res.status(200).json({ message: "Guide updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteGuide = async (req, res) => {
    try {
        const { id } = req.params;

        const guideToDelete = await Guide.findById({ _id: id }).populate(
            "creator",
        );

        if (!guideToDelete) throw new Error("Guide not found");

        const session = await mongoose.startSession();
        session.startTransaction();

        guideToDelete.remove({ session });
        guideToDelete.creator.allTours.pull(guideToDelete);

        await guideToDelete.creator.save({ session });
        await session.commitTransaction();

        res.status(200).json({ message: "Guide deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    getAllGuides,
    getGuideDetail,
    createGuide,
    updateGuide,
    deleteGuide,
};
