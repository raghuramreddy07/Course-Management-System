import express from "express";
import {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  adminListAllCourses,
} from "../controllers/courseController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";

const router = express.Router();

router.get("/", protect, listCourses);
router.get("/admin/all", protect, authorize("Admin"), adminListAllCourses);
router.get("/:id", protect, getCourse);
router.post("/", protect, authorize("Instructor", "Admin"), createCourse);
router.put("/:id", protect, authorize("Instructor", "Admin"), updateCourse);
router.delete("/:id", protect, authorize("Instructor", "Admin"), deleteCourse);

export default router;
