import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["Student", "Instructor", "Admin"],
      default: "Student",
    },
    profile: {
      headline: { type: String, default: "", trim: true },
      bio: { type: String, default: "", trim: true },
      phone: { type: String, default: "", trim: true },
      location: { type: String, default: "", trim: true },
      department: { type: String, default: "", trim: true },
      educationLevel: { type: String, default: "", trim: true },
      expertise: { type: String, default: "", trim: true },
      avatarUrl: { type: String, default: "", trim: true },
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });

export default mongoose.model("User", userSchema);
