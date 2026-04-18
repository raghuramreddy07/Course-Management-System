import Material from "../models/Material.js";
import Course from "../models/Course.js";
const baseUrl = (req) => `${req.protocol}://${req.get("host")}`;

export const listByCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const isOwner =
      course.instructorId.toString() === req.user._id.toString() ||
      req.user.role === "Admin";

    if (req.user.role === "Instructor" && !isOwner) {
      return res.status(403).json({ message: "Not your course" });
    }

    if (req.user.role === "Student") {
      const Enrollment = (await import("../models/Enrollment.js")).default;
      const en = await Enrollment.findOne({
        studentId: req.user._id,
        courseId: req.params.courseId,
      });
      if (!en) {
        return res.status(403).json({ message: "Enroll in this course to view materials" });
      }
    }

    const materials = await Material.find({ courseId: req.params.courseId }).sort({
      uploadedAt: -1,
    });
    res.json(materials);
  } catch (err) {
    next(err);
  }
};

export const createMaterial = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    if (
      req.user.role !== "Admin" &&
      course.instructorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not your course" });
    }

    const title = (req.body?.title ?? "").toString().trim();
    const type = (req.body?.type ?? "").toString().trim();
    if (!title || !type) {
      return res.status(400).json({ message: "title and type are required" });
    }
    const allowed = ["Video", "Notes", "Assignment"];
    if (!allowed.includes(type)) {
      return res.status(400).json({ message: "type must be Video, Notes, or Assignment" });
    }

    let fileUrl = "";
    if (req.file) {
      fileUrl = `${baseUrl(req)}/uploads/${req.file.filename}`;
    }

    const material = await Material.create({
      courseId: req.params.courseId,
      title: String(title).trim(),
      type,
      fileUrl,
      uploadedAt: new Date(),
    });
    res.status(201).json(material);
  } catch (err) {
    next(err);
  }
};

export const updateMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }
    const course = await Course.findById(material.courseId);
    const allowed =
      course &&
      (req.user.role === "Admin" ||
        course.instructorId.toString() === req.user._id.toString());
    if (!allowed) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const { title, type } = req.body;
    if (title !== undefined) material.title = String(title).trim();
    if (type !== undefined) {
      const allowed = ["Video", "Notes", "Assignment"];
      if (!allowed.includes(type)) {
        return res.status(400).json({ message: "Invalid type" });
      }
      material.type = type;
    }
    if (req.file) {
      material.fileUrl = `${baseUrl(req)}/uploads/${req.file.filename}`;
    }
    await material.save();
    res.json(material);
  } catch (err) {
    next(err);
  }
};

export const deleteMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }
    const course = await Course.findById(material.courseId);
    const allowed =
      course &&
      (req.user.role === "Admin" ||
        course.instructorId.toString() === req.user._id.toString());
    if (!allowed) {
      return res.status(403).json({ message: "Not allowed" });
    }
    await material.deleteOne();
    res.json({ message: "Material deleted" });
  } catch (err) {
    next(err);
  }
};
