import mongoose from "mongoose";

const materialSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["Video", "Notes", "Assignment"],
      required: true,
    },
    fileUrl: { type: String, default: "" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Material", materialSchema);
