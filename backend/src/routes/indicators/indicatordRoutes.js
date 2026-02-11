import express from "express";
import { computeIndicators, listIndicators, saveIndicatorSettings } from "../../controllers/indicators/indicatorController.js";

const router = express.Router();

/**
 * Compute indicators dynamically from DB
 */
router.get("/list", listIndicators); 
router.post("/compute", computeIndicators);
router.post("/save", saveIndicatorSettings); 
export default router;
