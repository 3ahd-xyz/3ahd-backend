require('dotenv').config();
const mysql = require('mysql2/promise'); // Use the promise API for cleaner async code

// Create a connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});



async function addUserDetails(phoneNumber, details) {
  const query = `
    INSERT INTO user_details (
      phoneNumber, firstName, lastName, 
      yearOfBirth, town
    ) VALUES (?, ?, ?, ?, ?);
  `;
  const params = [
    phoneNumber,
    details.firstName,
    details.familyName,
    details.yearOfBirth,
    details.town
  ];

  const [result] = await pool.query(query, params);
  return result.affectedRows;
}


async function addBus(details) {
  const query = `
      INSERT INTO buses (
        name, passengers, max_passengers, 
        go_time, get_back_time, date, link
      ) VALUES (?, ?, ?, ?, ?, ?, ?);
    `;
  const params = [
    details.name,
    details.passengers,
    details.max_passengers,
    details.go_time,
    details.get_back_time,
    details.date,
    details.link
  ];

  const [result] = await pool.query(query, params);
  return result;
}




async function getBuses() {
  const [rows] = await pool.query('SELECT * FROM buses');
  return rows;
}
async function getBuseById(id) {
  const [rows] = await pool.query('SELECT * FROM buses WHERE id = ?', [id]);
  if (rows.length === 0) return null;
  return rows[0];
}
async function getUserBusId(phoneNumber) {
  const [rows] = await pool.query('SELECT busId FROM user_details WHERE phoneNumber = ?', [phoneNumber]);
  console.log(phoneNumber + "has logged In..");
  console.log(rows)
  if (rows.length === 0) return null;
  return rows[0].busId;
}


async function getUsersByBusId(id) {
  const [rows] = await pool.query('SELECT firstName, lastName, phoneNumber FROM user_details WHERE busId = ?', [id]);
  return rows;
}



async function busPlusPlus(busId, phoneNumber, connection) {
  try {
    await connection.query('UPDATE buses SET passengers = passengers + 1 WHERE id = ?;', [busId]);
    console.log(busId + ": got new passenger: " + phoneNumber);
  } catch (error) {
    throw error;
  }
}

async function setUserBusId(busId, phoneNumber) {
  const connection = await pool.getConnection(); // Get a connection from the pool
  try {
    await connection.beginTransaction(); // Start transaction

    // Set user bus ID
    await connection.query('UPDATE user_details SET busId = ? WHERE phoneNumber = ?', [busId, phoneNumber]);
    console.log(phoneNumber + ": has been set to bus: " + busId);

    // Update bus passengers count
    await busPlusPlus(busId, phoneNumber, connection);

    await connection.commit(); // Commit transaction
  } catch (error) {
    await connection.rollback(); // Rollback transaction if an error occurs
    throw error; // Throw the error to be handled by the caller
  } finally {
    connection.release(); // Always release the connection back to the pool
  }
}



async function getUserDetailsByPhoneNumber(phoneNumber) {
  const query = `SELECT * FROM user_details WHERE phoneNumber = ?;`;

  const [rows] = await pool.query(query, [phoneNumber]);
  if (rows.length === 0) return null;
  return rows[0]; // Return a single user's details (or undefined if not found)
}

module.exports = {
  addUserDetails,
  getUserDetailsByPhoneNumber,
  getBuses,
  setUserBusId,
  getUserBusId,
  getBuseById,
  addBus,
  getUsersByBusId,
}