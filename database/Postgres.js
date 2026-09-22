const { Sequelize } = require('sequelize');
const pg = require('pg'); 
const db = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectModule: pg,
});

// const db = new Sequelize('new001', 'postgres', 'admin', {
//   host: 'localhost',
//   dialect: 'postgres',
//   logging: false,
// });

// Test the connection
async function testConnection() {
  try {
    await db.authenticate();
    console.log('Connected to the database.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();

module.exports = db;
