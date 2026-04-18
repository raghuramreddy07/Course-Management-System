import express from "express";
import {
  enroll,
  myEnrollments,
  unenroll,
  courseStudents,
} from "../controllers/enrollmentController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";

const router = express.Router();

router.post("/", protect, authorize("Student"), enroll);
router.get("/mine", protect, authorize("Student"), myEnrollments);
router.delete("/course/:courseId", protect, authorize("Student"), unenroll);
router.get(
  "/course/:courseId/students",
  protect,
  authorize("Instructor"),
  courseStudents
);

export default router;
