const transporter = require("../config/email");
const { newCouponTemplate } = require("../templates/emailTemplates");

const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"SULULU" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });

        console.log(`Email sent to ${to}`);

        return info;

    } catch (error) {
        console.error("Email sending failed:", error);
        throw error;
    }
};

const sendNewCouponEmail = async (user, coupon) => {
    return await sendEmail(
        user.email,
        "🎉 New Coupon Available",
        newCouponTemplate(user, coupon)
    );
};

module.exports = {
    sendEmail,
    sendNewCouponEmail
};