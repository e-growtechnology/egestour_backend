import Client from "../mongodb/models/client.js";
import User from "../mongodb/models/user.js";

import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

const getAllClients = async (req, res) => {
    const {
        _end,
        _order,
        _start,
        _sort,
        name_like = "",
        email = "",
        origin = "",
    } = req.query;

    const query = {};

    if (email !== "") {
        query.email = email;
    }

    if (name_like) {
        query.name = { $regex: name_like, $options: "i" };
    }

    if (origin !== "") {
        query.origin = origin;
    }

    try {
        const count = await Client.countDocuments({ query });

        const clients = await Client.find(query)
            .limit(_end)
            .skip(_start)
            .sort({ [_sort]: _order });

        res.header("x-total-count", count);
        res.header("Access-Control-Expose-Headers", "x-total-count");

        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getClientDetail = async (req, res) => {
    const { id } = req.params;
    const clientExists = await Client.findOne({ _id: id }).populate(
        "creator",
    );

    if (clientExists) {
        res.status(200).json(clientExists);
    } else {
        res.status(404).json({ message: "Client not found" });
    }
};

const createClient = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            preferences,
            origin,
            history,
            activities,
        } = req.body;

        const session = await mongoose.startSession();
        session.startTransaction();

        const user = await User.findOne({ email }).session(session);

        if (!user) throw new Error("User not found");

        const newClient = await Client.create({
            name,
            email,
            phone,
            preferences,
            origin,
            history,
            activities,
            creator: user._id,
        });

        await user.save({ session });

        await session.commitTransaction();

        res.status(200).json({ message: "Client created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, preferences, origin, history, activities } =
            req.body;

        await Client.findByIdAndUpdate(
            { _id: id },
            {
                name,
                email,
                phone,
                preferences,
                origin,
                history,
                activities,
            },
        );

        res.status(200).json({ message: "Client updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;

        const clientToDelete = await Client.findById({ _id: id }).populate(
            "creator",
        );

        if (!clientToDelete) throw new Error("Client not found");

        const session = await mongoose.startSession();
        session.startTransaction();

        clientToDelete.remove({ session });
        clientToDelete.creator.allTours.pull(clientToDelete);

        await clientToDelete.creator.save({ session });
        await session.commitTransaction();

        res.status(200).json({ message: "Client deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    getAllClients,
    getClientDetail,
    createClient,
    updateClient,
    deleteClient,
};
