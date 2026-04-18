import Submission from "../models/Submission.js";
import Material from "../models/Material.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

const baseUrl = (req) => `${req.protocol}://${req.get("host")}`;

export const submitAssignment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const material = await Material.findById(req.params.assignmentId);
    if (!material || material.type !== "Assignment") {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const course = await Course.findById(material.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrolled = await Enrollment.findOne({
      studentId: req.user._id,
      courseId: course._id,
    });
    if (!enrolled) {
      return res.status(403).json({ message: "You must be enrolled in this course" });
    }

    const fileUrl = `${baseUrl(req)}/uploads/${req.file.filename}`;

    const sub = await Submission.findOneAndUpdate(
      { assignmentId: material._id, studentId: req.user._id },
      { fileUrl, submittedAt: new Date() },
      { upsert: true, new: true, runValidators: true }
    );

    const populated = await Submission.findById(sub._id)
      .populate("assignmentId", "title type courseId")
      .populate("studentId", "name email");
    res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Submission already exists; use replace flow" });
    }
    next(err);
  }
};

export const mySubmissionsForCourse = async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const materials = await Material.find({ courseId, type: "Assignment" });
    const ids = materials.map((m) => m._id);
    const subs = await Submission.find({
      studentId: req.user._id,
      assignmentId: { $in: ids },
    }).populate("assignmentId", "title");
    res.json(subs);
  } catch (err) {
    next(err);
  }
};

export const listSubmissionsForAssignment = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.assignmentId);
    if (!material || material.type !== "Assignment") {
      return res.status(404).json({ message: "Assignment not found" });
    }
    const course = await Course.findById(material.courseId);
    const allowed =
      course &&
      (req.user.role === "Admin" ||
        course.instructorId.toString() === req.user._id.toString());
    if (!allowed) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const subs = await Submission.find({ assignmentId: material._id })
      .populate("studentId", "name email")
      .sort({ submittedAt: -1 });
    res.json(subs);
  } catch (err) {
    next(err);
  }
};
