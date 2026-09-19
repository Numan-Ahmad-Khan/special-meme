const { DataTypes } = require("sequelize");
const db = require("../datbase/Postgres");

const Coupon = db.define("Coupon", {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    details: {
        type: DataTypes.STRING,
        allowNull: false
    },

    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    discountType: {
        type: DataTypes.ENUM("FIXED", "PERCENTAGE"),
        allowNull: false
    },

    discountValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },

    eligibility: {
        type: DataTypes.ENUM(
            "ALL",
            "FIRST_PURCHASE",
            "EXISTING_BUYER"
        ),
        allowNull: false,
        defaultValue: "ALL"
    },

    minOrderAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },

    maxDiscountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },

    startsAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    expiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    },

    usageLimit: {
        type: DataTypes.INTEGER,
        allowNull: true
    },

    usedCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },

    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }

}, {
    timestamps: true
});

module.exports = Coupon;