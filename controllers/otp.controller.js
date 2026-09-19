const otpService = require("../services/otp.service");

const generateOTP = async (req, res, next) => {
    try {
        await otpService.generateAndSendOTP(req.user.userId);

        return res.status(200).json({
            message: "OTP sent successfully"
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateOTP
};