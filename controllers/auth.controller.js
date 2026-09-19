const authService = require("../services/auth.service");
const { signupSchema, loginSchema } = require("../validators/auth.validator");
const jwt = require("jsonwebtoken");

const signup = async (req, res, next) => {
    const result = signupSchema.safeParse(req.body);

    if (!result.success) {
        const formattedErrors = result.error.format();

        return res.status(400).json({
            errors: formattedErrors
        });
    }

    try {
        const { name, email, password } = result.data;
        const role = req.body.role;

        const createdUser = await authService.signupUser(
            name,
            email,
            password,
            role
        );

        return res.status(200).json({
            message: "User Created",
            name: createdUser.name,
            email: createdUser.email
        });

    } catch (error) {
        next(error);
    }
};


const login = async (req, res, next) => {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Error invalid input format"
        });
    }

    try {
        const { email, password } = result.data;

        const user = await authService.loginUser(
            email,
            password
        );

        const token = jwt.sign(
            {
                userId: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.json({
            msg: "Logged In",
            token,
            user: user.id
        });

    } catch (error) {
        next(error);
    }
};

const riderSignup = async (req, res, next) => {

    const result = signupSchema.safeParse(req.body);

    if (!result.success) {
        const formattedErrors = result.error.format();

        return res.status(400).json({
            errors: formattedErrors
        });
    }

    try {
        const { name, email, password } = result.data;

        const createdRider = await authService.signupRider(
            name,
            email,
            password,
            req.body.latitude,
            req.body.longitude
        );

        return res.status(200).json({
            message: "Rider Created",
            name: createdRider.name,
            email: createdRider.email
        });

    } catch (error) {
        next(error);
    }
};

const riderLogin = async (req, res, next) => {

    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            message: "Error invalid input format"
        });
    }

    try {
        const { email, password } = result.data;

        const rider = await authService.loginRider(
            email,
            password
        );

        const token = jwt.sign(
            {
                riderId: rider.id,
                name: rider.name,
                email: rider.email,
                role: rider.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.json({
            msg: "Logged In",
            token,
            rider: rider.id
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    signup,
    login,
    riderSignup,
    riderLogin
};