import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";

export const enroll = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const existing = await Enrollment.findOne({
      studentId: req.user._id,
      courseId,
    });
    if (existing) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    const enrollment = await Enrollment.create({
      studentId: req.user._id,
      courseId,
    });
    const populated = await Enrollment.findById(enrollment._id)
      .populate("courseId", "title description price instructorId")
      .populate("studentId", "name email");
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

export const myEnrollments = async (req, res, next) => {
  try {
    const list = await Enrollment.find({ studentId: req.user._id })
      .populate("courseId")
      .sort({ enrolledAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
};

export const unenroll = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const result = await Enrollment.findOneAndDelete({
      studentId: req.user._id,
      courseId,
    });
    if (!result) {
      return res.status(404).json({ message: "Enrollment not found" });
    }
    res.json({ message: "Unenrolled" });
  } catch (err) {
    next(err);
  }
};

export const courseStudents = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (course.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your course" });
    }
    const list = await Enrollment.find({ courseId: req.params.courseId }).populate(
      "studentId",
      "name email createdAt"
    );
    res.json(list);
  } catch (err) {
    next(err);
  }
};
