import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const authCookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const clearAuthCookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  path: "/",
};

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendTokenCookie = (res, token) => {
  res.cookie("token", token, authCookieOptions);
};

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profile: user.profile || {},
  createdAt: user.createdAt,
});

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const allowedRoles = ["Student", "Instructor"];
    const userRole = allowedRoles.includes(role) ? role : "Student";

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: userRole,
    });

    const token = signToken(user._id);
    sendTokenCookie(res, token);

    res.status(201).json({
      user: serializeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user._id);
    sendTokenCookie(res, token);

    res.json({
      user: serializeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res) => {
  res.json({
    user: serializeUser(req.user),
  });
};

export const logout = (_req, res) => {
  res.clearCookie("token", clearAuthCookieOptions);
  res.json({ message: "Logged out successfully" });
};
