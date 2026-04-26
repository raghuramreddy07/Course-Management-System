import express from "express";
import {
  listUsers,
  getUser,
  getMyProfile,
  updateMyProfile,
  getInstructorProfile,
  updateUserRole,
  deleteUser,
  createAdmin,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";

const router = express.Router();

router.post("/bootstrap-admin", createAdmin);
router.get("/me/profile", protect, getMyProfile);
router.put("/me/profile", protect, updateMyProfile);
router.get("/instructors/:id/profile", protect, getInstructorProfile);
router.get("/", protect, authorize("Admin"), listUsers);
router.get("/:id", protect, authorize("Admin"), getUser);
router.patch("/:id/role", protect, authorize("Admin"), updateUserRole);
router.delete("/:id", protect, authorize("Admin"), deleteUser);

export default router;
