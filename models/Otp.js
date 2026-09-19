const { DataTypes } = require("sequelize")
const db = require("../datbase/Postgres")

const Otp = db.define("Otp", {
id:{
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
},

userId: {
        type: DataTypes.STRING,
        allowNull: false
    },

otpHash: {
  type: DataTypes.STRING,
  allowNull: true
},

otpExpiresAt: {
  type: DataTypes.DATE,
  allowNull: true
},

otpAttempts: {
  type: DataTypes.INTEGER,
  defaultValue: 0
}
})

module.exports = Otp