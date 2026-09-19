const { DataTypes } = require("sequelize");
const db = require("../datbase/Postgres");
const Config = db.define("Config",{
    id:{
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        defaultValue: "SINGLETON"
    },
    rateKeyDistance: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rateValueDistance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    rateKeyDimensions:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    rateValueDimensions: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    rateKeyWeight: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rateValueWeight: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    }
  }, {
    timestamps: true,
    createdAt: false 
  });


  module.exports = Config