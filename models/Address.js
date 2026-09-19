const { DataTypes } = require("sequelize");
const db = require("../database/Postgres");
const Address = db.define("Address",{
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    street: {
        type: DataTypes.STRING,
        allowNull: false
    },
    longitude: {
        type: DataTypes.DECIMAL(10, 6),
        //type:DataTypes.INTEGER,
        allowNull: false
    },
    latitude: {
        type: DataTypes.DECIMAL(9, 6),
        //type:DataTypes.INTEGER,
        allowNull: false
    },
    pincode: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    landmark: {
        type: DataTypes.STRING,
        allowNull: true
    },
    addresstype:{
        type: DataTypes.ENUM("PICKUP", "DROP", "RIDER_LOCATION"),
        allowNull: false
    }
},
{timestamps: true})

module.exports = Address;