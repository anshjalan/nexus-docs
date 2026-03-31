const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
{
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 15,
    trim: true,
  },

  lastName: {
    type: String,
    maxlength: 15,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid email");
      }
    },
  },

  password: {
    type: String,
    required: true,
  },

  createdDocuments: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
    default: [],
  },

  sharedDocuments: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
    default: [],
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
},
{
  timestamps: true
}
);

module.exports = mongoose.model("User", userSchema);