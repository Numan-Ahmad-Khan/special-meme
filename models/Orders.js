const { DataTypes } = require("sequelize");
const db = require("../database/Postgres");

const Order = db.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    orderName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    orderDetails: {
        type: DataTypes.STRING,
        allowNull: false
    },
    orderWeight:{
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    orderLength:{
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    orderBreadth:{
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    orderHeight:{
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM("ACCEPTED", "REJECTED", "IN_TRANSIT", "FAILED", "PROCESSING"),
        allowNull: false,
        defaultValue: "PROCESSING"
    },
    transitDetail:{
        type: DataTypes.STRING,
        allowNull: true,
        default: "No details yet"
    },
    riderId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    pickup: {
        type: DataTypes.STRING,
        allowNull: false
    },
    drop: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price:{
        type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    paymentStatus: {
    type: DataTypes.ENUM(
        "PENDING",
        "PAID",
        "FAILED",
        "EXPIRED"
    ),
    defaultValue: "PENDING"
    },

    paymentLinkId: {
    type: DataTypes.STRING,
    allowNull: true
    },

    paymentLink: {
    type: DataTypes.TEXT,
    allowNull: true
    },
    
    couponCode: {
    type: DataTypes.STRING,
    allowNull: true
    },
    
    discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
    },

    originalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
    },
    
    finalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
    }
}, 
{
    timestamps: true
});

module.exports = Order;
