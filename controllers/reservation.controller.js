import Reservation from "../mongodb/models/reservation.js";
import Tour from "../mongodb/models/tour.js";
import mongoose from "mongoose";

const getAllReservations = async (req, res) => {
    const { _end, _order, _start, _sort } = req.query;

    try {
        const count = await Reservation.countDocuments();

        const reservations = await Reservation.find()
            .limit(_end)
            .skip(_start)
            .sort({ [_sort]: _order });

        res.header("x-total-count", count);
        res.header("Access-Control-Expose-Headers", "x-total-count");

        res.status(200).json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getReservationDetail = async (req, res) => {
    const { id } = req.params;

    try {
        const reservation = await Reservation.findById(id).populate("activity");

        if (reservation) {
            res.status(200).json(reservation);
        } else {
            res.status(404).json({ message: "Reservation not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createReservation = async (req, res) => {
    try {
        const {
            user,
            companions,
            activityId,
            date,
            seats,
        } = req.body;

        // Verificar se a atividade (Tour) existe antes de criar a reserva
        const tour = await Tour.findById(activityId);
        if (!tour) throw new Error("Activity not found");

        const newReservation = await Reservation.create({
            user,
            companions,
            activity: activityId,
            date,
            seats,
        });

        res.status(200).json({ message: "Reservation created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const { user, companions, date, seats } = req.body;

        await Reservation.findByIdAndUpdate(
            { _id: id },
            {
                user,
                companions,
                date,
                seats,
            }
        );

        res.status(200).json({ message: "Reservation updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteReservation = async (req, res) => {
    try {
        const { id } = req.params;

        const reservationToDelete = await Reservation.findById(id);

        if (!reservationToDelete) throw new Error("Reservation not found");

        await reservationToDelete.remove();

        res.status(200).json({ message: "Reservation deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
    getAllReservations,
    getReservationDetail,
    createReservation,
    updateReservation,
    deleteReservation,
};