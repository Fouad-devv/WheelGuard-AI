
import express from "express";

const router = express.Router();

import { handGetHome } from "../controllers/homeController.js";

router.get('/', handGetHome);

export default router;