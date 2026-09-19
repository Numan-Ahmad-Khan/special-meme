const bcrypt = require("bcrypt");
const Rider = require("../models/Rider");
const User = require("../models/Users");

const signupUser = async (name, email, password, role) => {

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await User.create({
        name: name,
        email: email,
        password: hashedPassword,
        role: role
    });

    return createdUser;
};

const loginUser = async (email, password) => {

    const user = await User.findOne({
        where: {
            email
        }
    });

    if (!user) {
        const error = new Error("Invalid Credentials");
        error.statusCode = 401;
        throw error;
    }

    if (!user.isActive) {
        const error = new Error("User deactivated");
        error.statusCode = 403;
        throw error;
    }

    const verification = await bcrypt.compare(
        password,
        user.password
    );

    if (!verification) {
        const error = new Error("Invalid password");
        error.statusCode = 401;
        throw error;
    }

    return user;
};

const signupRider = async (name, email, password, latitude, longitude) => {

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdRider = await Rider.create({
        name: name,
        email: email,
        password: hashedPassword,
        latitude: latitude,
        longitude: longitude
    });

    return createdRider;
};

const loginRider = async (email, password) => {

    const rider = await Rider.findOne({
        where: {
            email
        }
    });

    if (!rider) {
        const error = new Error("Invalid Credentials");
        error.statusCode = 401;
        throw error;
    }

    if (!rider.isActive) {
        const error = new Error("Rider has account deactivated");
        error.statusCode = 403;
        throw error;
    }

    const verification = await bcrypt.compare(
        password,
        rider.password
    );

    if (!verification) {
        const error = new Error("Invalid password");
        error.statusCode = 401;
        throw error;
    }

    return rider;
};

module.exports = {
    signupUser,
    loginUser,
    signupRider,
    loginRider
};