const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const validator = require("validator");

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    const checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
      return res.status(401).json({ success: false, message: "User already registered" });
    }

    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const otpPayload = { email, otp };
    await OTP.create(otpPayload);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, otp } = req.body;

    if (!firstName || !email || !password || !otp) {
      return res.status(403).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const user = await User.findOne({ email: email });
    if (user) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const recentOTP = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (recentOTP.length === 0 || otp !== recentOTP[0].otp) {
      return res.status(400).json({ success: false, message: "The OTP is not valid or expired" });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password is not strong enough. Must include uppercase, lowercase, number, and special character.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const userResponse = newUser.toObject();
    delete userResponse.password;

    const token = jwt.sign({ _id: user._id }, process.env.JWT_HASH_KEY);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.json({
      message: "Signup successful",
      user,
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid Credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid Credentials" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_HASH_KEY, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      expires: new Date(Date.now() + 24 * 3600000),
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ 
      success: true, 
      message: "Login successful", 
      data: userResponse 
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });
    res.json({ success: true, message: "Logout successful" });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};