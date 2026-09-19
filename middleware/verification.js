const User = require("../models/Users");

const isVerified = async (req, res, next) => {
    try {
        const user = await User.findOne({where: req.user.userId});
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        if (!user.isVerified) {
            return res.json({
                msg: "Please verify your account before placing an order"
            });
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = isVerified;