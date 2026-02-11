import express from "express";
import { computeIndicators, listIndicators } from "../../controllers/indicators/indicatorController.js";

const router = express.Router();

/**
 * Compute indicators dynamically from DB
 */
router.get("/list", listIndicators); 
router.post("/compute", computeIndicators);

export default router;
