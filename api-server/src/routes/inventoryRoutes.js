import express from "express";
const router = express.Router();

import inventoryControllers from "../controllers/inventoryControllers.js";
import authMiddleware from "../middlewares/authMiddleware.js";

router.get("/", authMiddleware, inventoryControllers.listInventories);

// Create new inventory log
// router.post("/", authMiddleware, validateInventory, validateRequest, inventoryControllers.createProduct);

export default router;
export { router };
