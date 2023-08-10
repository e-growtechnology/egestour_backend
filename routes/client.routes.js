import express from "express";

import {
    createClient,
    deleteClient,
    getAllClients,
    getClientDetail,
    updateClient,
} from "../controllers/client.controller.js";

const router = express.Router();

router.route("/").get(getAllClients);
router.route("/:id").get(getClientDetail);
router.route("/").post(createClient);
router.route("/:id").patch(updateClient);
router.route("/:id").delete(deleteClient);

export default router;
