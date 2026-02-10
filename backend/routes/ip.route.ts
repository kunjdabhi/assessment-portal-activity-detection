import { Router } from "express";
import { addEventLog, registerIp } from "../controllers/ip.controller.js";

const router = Router();

router.post("/ip", registerIp);
router.post("/events", addEventLog);

export default router;