const User = require("../models/User");
const OTP = require("../models/OTP");
const Document = require("../models/Document");
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

    const token = jwt.sign({ _id: newUser._id }, process.env.JWT_HASH_KEY, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      expires: new Date(Date.now() + 24 * 3600000),
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.json({
      success: true,
      message: "Signup successful",
      user: userResponse,
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

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const userId = req.user._id;

    if (!firstName) {
      return res.status(400).json({
        success: false,
        message: "First name is required",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile updated",
      data: user,
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both current and new password are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    if (!validator.isStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password is not strong enough. Must include uppercase, lowercase, number, and special character.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Failed to change password" });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const ownedDocuments = await Document.find({ owner: userId }).select("_id");
    const ownedDocumentIds = ownedDocuments.map((doc) => doc._id);

    if (ownedDocumentIds.length > 0) {
      await Document.deleteMany({ owner: userId });

      await User.updateMany(
        {
          $or: [
            { createdDocuments: { $in: ownedDocumentIds } },
            { sharedDocuments: { $in: ownedDocumentIds } },
          ],
        },
        {
          $pull: {
            createdDocuments: { $in: ownedDocumentIds },
            sharedDocuments: { $in: ownedDocumentIds },
          },
        }
      );
    }

    await Document.updateMany(
      { collaborators: userId },
      { $pull: { collaborators: userId } }
    );

    await User.findByIdAndDelete(userId);

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    res.json({
      success: true,
      message: "Profile deleted successfully",
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete profile",
    });
  }
};