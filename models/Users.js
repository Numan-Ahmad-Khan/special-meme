const { DataTypes } = require("sequelize")
const db = require("../datbase/Postgres")

const User = db. define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        },
    name: {
        type: DataTypes.STRING,
        allowNull: false
        },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM("ADMIN", "USER"),
        defaultValue: "USER"
        },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
    

},
{timestamps:true}
)

module.exports = User