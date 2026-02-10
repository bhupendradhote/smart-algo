import express from "express";
import { computeIndicators } from "../../controllers/indicators/indicatorController.js";

const router = express.Router();

/**
 * Compute indicators dynamically from DB
 */
router.post("/compute", computeIndicators);

export default router;
