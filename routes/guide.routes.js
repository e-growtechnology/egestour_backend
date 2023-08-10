import express from "express";

import {
    createGuide,
    deleteGuide,
    getAllGuides,
    getGuideDetail,
    updateGuide,
} from "../controllers/guide.controller.js";

const router = express.Router();

router.route("/").get(getAllGuides);
router.route("/:id").get(getGuideDetail);
router.route("/").post(createGuide);
router.route("/:id").patch(updateGuide);
router.route("/:id").delete(deleteGuide);

export default router;
