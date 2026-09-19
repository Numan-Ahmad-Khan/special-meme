const { DataTypes } = require("sequelize");
const db = require("../datbase/Postgres");

const Checkpoint = db.define("Checkpoint", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    checkpointName:{
        type: DataTypes.STRING,
        allowNull: false
    },
    checkpointDetail:{
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
}) 

module.exports = Checkpoint