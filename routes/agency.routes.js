import express from "express";

import {
    createAgency,
    deleteAgency,
    getAllAgencies,
    getAgencyDetail,
    updateAgency,
} from "../controllers/agency.controller.js";

const router = express.Router();

router.route("/").get(getAllAgencies);
router.route("/:id").get(getAgencyDetail);
router.route("/").post(createAgency);
router.route("/:id").patch(updateAgency);
router.route("/:id").delete(deleteAgency);

export default router;
