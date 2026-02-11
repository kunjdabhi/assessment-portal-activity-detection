import { Router } from "express";
import { addEventLog, registerIp, checkIp, completeAttempt } from "../controllers/ip.controller.js";

const router = Router();

router.post("/ip", registerIp);
router.post("/events", addEventLog);
router.post("/check-ip", checkIp);
router.post("/complete-attempt", completeAttempt);

export default router;