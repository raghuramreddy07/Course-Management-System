import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

const instructorPopulateFields = "name email role profile";
const DEFAULT_COURSE_PRICE = 499;
const MAX_COURSE_PRICE = 5000;

const parseCoursePrice = (price, fallback = DEFAULT_COURSE_PRICE) => {
  if (price === undefined || price === null || price === "") {
    return fallback;
  }

  const value = Number(price);
  if (!Number.isFinite(value) || value < 0 || value > MAX_COURSE_PRICE) {
    return null;
  }

  return Math.round(value);
};

const addEnrollmentCounts = async (courses) => {
  const plainCourses = courses.map((course) =>
    typeof course.toObject === "function" ? course.toObject() : course
  );
  const ids = plainCourses.map((course) => course._id);

  if (ids.length === 0) {
    return plainCourses;
  }

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

export const listCourses = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === "Instructor") {
      filter.instructorId = req.user._id;
    }
    const courses = await Course.find(filter)
      .populate("instructorId", instructorPopulateFields)
      .sort({ createdAt: -1 });
    res.json(await addEnrollmentCounts(courses));
  } catch (err) {
    next(err);
  }
};

export const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "instructorId",
      instructorPopulateFields
    );
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (req.user.role === "Instructor" && course.instructorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your course" });
    }
    const [courseWithCount] = await addEnrollmentCounts([course]);
    res.json(courseWithCount);
  } catch (err) {
    next(err);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const { title, description, instructorId, price } = req.body;
    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: "Title is required" });
    }
    const coursePrice = parseCoursePrice(price);
    if (coursePrice === null) {
      return res.status(400).json({ message: "Price must be between Rs. 0 and Rs. 5000" });
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
      price: coursePrice,
      instructorId: ownerId,
    });
    const populated = await Course.findById(course._id).populate(
      "instructorId",
      instructorPopulateFields
    );
    const [courseWithCount] = await addEnrollmentCounts([populated]);
    res.status(201).json(courseWithCount);
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
    const { title, description, price } = req.body;
    if (title !== undefined) course.title = String(title).trim();
    if (description !== undefined) course.description = description;
    if (price !== undefined) {
      const coursePrice = parseCoursePrice(price, course.price ?? DEFAULT_COURSE_PRICE);
      if (coursePrice === null) {
        return res.status(400).json({ message: "Price must be between Rs. 0 and Rs. 5000" });
      }
      course.price = coursePrice;
    }
    await course.save();
    const populated = await Course.findById(course._id).populate(
      "instructorId",
      instructorPopulateFields
    );
    const [courseWithCount] = await addEnrollmentCounts([populated]);
    res.json(courseWithCount);
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
      .populate("instructorId", instructorPopulateFields)
      .sort({ createdAt: -1 });
    res.json(await addEnrollmentCounts(courses));
  } catch (err) {
    next(err);
  }
};
