import Course from "../models/Course.js";

export const listCourses = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === "Instructor") {
      filter.instructorId = req.user._id;
    }
    const courses = await Course.find(filter)
      .populate("instructorId", "name email")
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    next(err);
  }
};

export const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "instructorId",
      "name email"
    );
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (req.user.role === "Instructor" && course.instructorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your course" });
    }
    res.json(course);
  } catch (err) {
    next(err);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const { title, description, instructorId } = req.body;
    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    let ownerId = req.user._id;
    if (req.user.role === "Admin" && instructorId) {
      const User = (await import("../models/User.js")).default;
      const inst = await User.findById(instructorId);
      if (!inst || inst.role !== "Instructor") {
        return res.status(400).json({ message: "Invalid instructor" });
      }
      ownerId = instructorId;
    }
    const course = await Course.create({
      title: title.trim(),
      description: description || "",
      instructorId: ownerId,
    });
    const populated = await Course.findById(course._id).populate(
      "instructorId",
      "name email"
    );
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (req.user.role === "Instructor" && course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your course" });
    }
    const { title, description } = req.body;
    if (title !== undefined) course.title = String(title).trim();
    if (description !== undefined) course.description = description;
    await course.save();
    const populated = await Course.findById(course._id).populate(
      "instructorId",
      "name email"
    );
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (req.user.role === "Instructor" && course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your course" });
    }
    await course.deleteOne();
    res.json({ message: "Course deleted" });
  } catch (err) {
    next(err);
  }
};

export const adminListAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .populate("instructorId", "name email")
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    next(err);
  }
};
