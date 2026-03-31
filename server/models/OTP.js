const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 5,
    },
});

async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(
            email,
            "Verification Email",
            `<h2>Nexus Docs Verification</h2>
             <p>Your OTP is:</p>
             <h1>${otp}</h1>
             <p>This OTP will expire in 5 minutes.</p>`
        );
        console.log("Verification email sent successfully");

    } catch (error) {
        console.log("Error occurred while sending OTP email: ", error);
        throw error;
    }
}

otpSchema.pre("save", async function () {
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp);
    }
});

module.exports = mongoose.model("OTP", otpSchema);
