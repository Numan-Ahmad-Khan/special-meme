const { DataTypes } = require("sequelize");
const db = require("../database/Postgres");

const CouponUsage = db.define("CouponUsage", {
    id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
    },

    couponId: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    orderId: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    discountAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }

}, {
    timestamps: true
});

module.exports = CouponUsage;