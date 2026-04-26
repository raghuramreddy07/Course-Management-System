import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import bcrypt from "bcryptjs";

const userSelect = "-password";

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profile: user.profile || {},
  createdAt: user.createdAt,
});

const profileFields = [
  "headline",
  "bio",
  "phone",
  "location",
  "department",
  "educationLevel",
  "expertise",
  "avatarUrl",
];

const cleanProfile = (profile = {}) =>
  profileFields.reduce((next, field) => {
    if (profile[field] !== undefined) {
      next[field] = String(profile[field]).trim();
    }
    return next;
  }, {});

const addEnrollmentCounts = async (courses) => {
  const plainCourses = courses.map((course) =>
    typeof course.toObject === "function" ? course.toObject() : course
  );
  const ids = plainCourses.map((course) => course._id);
  const counts = await Enrollment.aggregate([
    { $match: { courseId: { $in: ids } } },
    { $group: { _id: "$courseId", enrolledCount: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((item) => [item._id.toString(), item.enrolledCount]));
  return plainCourses.map((course) => ({
    ...course,
    enrolledCount: countMap.get(course._id.toString()) || 0,
  }));
};

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select(userSelect).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(userSelect);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const getMyProfile = async (req, res) => {
  res.json({ user: userPayload(req.user) });
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }
      user.name = name;
    }

    user.profile = {
      ...(user.profile?.toObject?.() || user.profile || {}),
      ...cleanProfile(req.body.profile),
    };
    await user.save();
    res.json({ user: userPayload(user) });
  } catch (err) {
    next(err);
  }
};

export const getInstructorProfile = async (req, res, next) => {
  try {
    const instructor = await User.findOne({
      _id: req.params.id,
      role: "Instructor",
    }).select(userSelect);

    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }

    const courses = await Course.find({ instructorId: instructor._id })
      .populate("instructorId", "name email role profile")
      .sort({ createdAt: -1 });
    const coursesWithCounts = await addEnrollmentCounts(courses);

    res.json({
      instructor: userPayload(instructor),
      courses: coursesWithCounts,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowed = ["Student", "Instructor", "Admin"];
    if (!role || !allowed.includes(role)) {
      return res.status(400).json({ message: "Valid role required" });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot change your own role here" });
    }
    user.role = role;
    await user.save();
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }
    await user.deleteOne();
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
};

/** Seed first admin — call once if no admins exist (optional helper) */
export const createAdmin = async (req, res, next) => {
  try {
    const adminCount = await User.countDocuments({ role: "Admin" });
    if (adminCount > 0) {
      return res.status(400).json({ message: "Admin already exists" });
    }
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email, password required" });
    }
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "Admin",
    });
    res.status(201).json({
      message: "Admin created",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};
