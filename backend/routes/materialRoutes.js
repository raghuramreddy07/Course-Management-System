import express from "express";
import {
  listByCourse,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "../controllers/materialController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { uploadSingle } from "../middleware/upload.js";

const router = express.Router();

router.get("/course/:courseId", protect, listByCourse);
router.post(
  "/course/:courseId",
  protect,
  authorize("Instructor", "Admin"),
  uploadSingle("file"),
  createMaterial
);
router.put(
  "/:id",
  protect,
  authorize("Instructor", "Admin"),
  uploadSingle("file"),
  updateMaterial
);
router.delete("/:id", protect, authorize("Instructor", "Admin"), deleteMaterial);

export default router;
