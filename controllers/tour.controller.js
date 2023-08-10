import Tour from "../mongodb/models/tour.js";
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

const getAllTours = async (req, res) => {
    const {
        _end,
        _order,
        _start,
        _sort,
        title_like = "",
        tourType = "",
    } = req.query;

    const query = {};

    if (tourType !== "") {
        query.tourType = tourType;
    }

    if (title_like) {
        query.title = { $regex: title_like, $options: "i" };
    }

    try {
        const count = await Tour.countDocuments({ query });

        const tours = await Tour.find(query)
            .limit(_end)
            .skip(_start)
            .sort({ [_sort]: _order });

        res.header("x-total-count", count);
        res.header("Access-Control-Expose-Headers", "x-total-count");

        res.status(200).json(tours);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTourDetail = async (req, res) => {
    const { id } = req.params;
    const tourExists = await Tour.findOne({ _id: id }).populate(
        "creator",
    );

    if (tourExists) {
        res.status(200).json(tourExists);
    } else {
        res.status(404).json({ message: "Tour not found" });
    }
};

const createTour = async (req, res) => {
    try {
        const {
            title,
            description,
            tourType,
            location,
            price,
            photo,
            orientation,
            extras,
            email,
        } = req.body;

        const session = await mongoose.startSession();
        session.startTransaction();

        const user = await User.findOne({ email }).session(session);

        if (!user) throw new Error("User not found");

        const photoUrl = await cloudinary.uploader.upload(photo);

        const newTour = await Tour.create({
            title,
            description,
            tourType,
            location,
            price,
            photo: photoUrl.url,
            orientation,
            extras,
            creator: user._id,
        });

        user.allTours.push(newTour._id);
        await user.save({ session });

        await session.commitTransaction();

        res.status(200).json({ message: "Tour created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTour = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, tourType, location, price, photo, orientation, extras } =
            req.body;

        const photoUrl = await cloudinary.uploader.upload(photo);

        await Tour.findByIdAndUpdate(
            { _id: id },
            {
                title,
                description,
                tourType,
                location,
                price,
                photo: photoUrl.url || photo,
                orientation,
                extras,
            },
        );

        res.status(200).json({ message: "Tour updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTour = async (req, res) => {
    try {
        const { id } = req.params;

        const tourToDelete = await Tour.findById({ _id: id }).populate(
            "creator",
        );

        if (!tourToDelete) throw new Error("Tour not found");

        const session = await mongoose.startSession();
        session.startTransaction();

        tourToDelete.remove({ session });
        tourToDelete.creator.allTours.pull(tourToDelete);

        await tourToDelete.creator.save({ session });
        await session.commitTransaction();

        res.status(200).json({ message: "Tour deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    getAllTours,
    getTourDetail,
    createTour,
    updateTour,
    deleteTour,
};
