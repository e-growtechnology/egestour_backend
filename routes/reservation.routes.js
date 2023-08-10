import express from "express";
import {
    createReservation,
    deleteReservation,
    getAllReservations,
    getReservationDetail,
    updateReservation,
} from "../controllers/reservation.controller.js";

const router = express.Router();

router.route("/reservations").get(getAllReservations);
router.route("/reservations/:id").get(getReservationDetail);
router.route("/reservations").post(createReservation);
router.route("/reservations/:id").patch(updateReservation);
router.route("/reservations/:id").delete(deleteReservation);

export default router;