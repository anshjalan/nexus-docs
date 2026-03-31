const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  try {
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    const decodedMessage = jwt.verify(token, process.env.JWT_HASH_KEY);
    const { _id } = decodedMessage;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = authMiddleware;
