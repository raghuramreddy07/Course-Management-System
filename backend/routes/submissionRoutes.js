import express from "express";
import {
  submitAssignment,
  mySubmissionsForCourse,
  listSubmissionsForAssignment,
} from "../controllers/submissionController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";
import { uploadSingle } from "../middleware/upload.js";

const router = express.Router();

router.post(
  "/assignment/:assignmentId",
  protect,
  authorize("Student"),
  uploadSingle("file"),
  submitAssignment
);
router.get(
  "/course/:courseId/mine",
  protect,
  authorize("Student"),
  mySubmissionsForCourse
);
router.get(
  "/assignment/:assignmentId/list",
  protect,
  authorize("Instructor", "Admin"),
  listSubmissionsForAssignment
);

export default router;
