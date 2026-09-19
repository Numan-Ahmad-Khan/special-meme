router.post("/user/generate-otp", authentication, async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                id: req.user.userId
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                message: "User is already verified"
            });
        }

        const otp = generateOTP();

        const otpHash = await bcrypt.hash(otp, 10);
        // Debug purpose 
        console.log(`OTP: ${otp}`)
        await sendEmail(
            user.email,
            "Your FastLy Verification OTP",
            `
                <h2>Email Verification</h2>

                <p>Hello ${user.name},</p>

                <p>Your verification OTP is:</p>

                <h1>${otp}</h1>

                <p>
                    This OTP is valid for <strong>5 minutes</strong>.
                </p>

                <p>
                    If you did not request this OTP,
                    you can safely ignore this email.
                </p>

                <br>

                <p>
                    Thank you,<br>
                    FastLy
                </p>
            `
        );

        // Email was successfully sent.
        // Now remove the previous OTP.
        await Otp.destroy({
            where: {
                userId: user.id
            }
        });

        // Save the new OTP hash
        await Otp.create({
            userId: user.id,
            otpHash: otpHash,
            otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
            otpAttempts: 0
        });

        return res.status(200).json({
            message: "OTP sent successfully"
        });

    } catch (error) {

        console.error("OTP email error:", error);

        return res.status(500).json({
            message: "Failed to send OTP. Please try again."
        });
    }
});