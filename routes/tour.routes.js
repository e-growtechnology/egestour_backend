import express from "express";

import {
    createTour,
    deleteTour,
    getAllTours,
    getTourDetail,
    updateTour,
} from "../controllers/tour.controller.js";

const router = express.Router();

router.route("/").get(getAllTours);
router.route("/:id").get(getTourDetail);
router.route("/").post(createTour);
router.route("/:id").patch(updateTour);
router.route("/:id").delete(deleteTour);

export default router;
