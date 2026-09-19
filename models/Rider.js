const { DataTypes } = require("sequelize")
const db = require("../database/Postgres")

const Rider = db.define("Rider", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        },
    name:{
        type: DataTypes.STRING,
        allowNull: false
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password:{
        type:DataTypes.STRING,
        allowNull: false
    },
    latitude:{
        type: DataTypes.DECIMAL(9, 6),
        allowNull: false
    },
    longitude:{
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false
    },
    // oderId:{
    //     type:DataTypes.STRING,
    //     allowNull:true,
    //     defaultValue: "Not working on any order currently"
    // },
    status:{
        type: DataTypes.ENUM("FREE", "OCUPIED", "NOT_AVAILABLE", "DEACTIVEVATED"),
        defaultValue: "FREE",
        allowNull: false
    },
    role:{
        type: DataTypes.STRING,
        defaultValue: "RIDER",
        allowNull: false
    },
    isActive:{
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
})

module.exports = Rider