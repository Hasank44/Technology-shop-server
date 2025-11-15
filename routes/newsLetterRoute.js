import express from "express";
import { getAllNewsLetters, newsletterSubscribeController } from "../controllers/newsletterController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get('/all', isAuthenticated, roleMiddleware('admin'), getAllNewsLetters);
router.post('/subscribe', newsletterSubscribeController);

export default router;