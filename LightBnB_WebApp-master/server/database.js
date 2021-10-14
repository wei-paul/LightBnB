const properties = require('./json/properties.json');
const users = require('./json/users.json');
const { Pool } = require('pg');
/// Users
const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});
/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  return pool
  .query(`SELECT * 
          FROM users
          WHERE email = $1;
          `, [email])
  .then((res) => res.rows[0])
  .catch((err) => {
    console.log(err)
    return null;
  });
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool
  .query(`SELECT * 
          FROM users
          WHERE id = $1;
          `, [id])
  .then((res) => res.rows[0])
  .catch((err) => {
    console.log(err)
    return null;
  });
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  return pool
  .query(`INSERT INTO users (name, email, password) 
          VALUES ($1, $2, $3)
          RETURNING *;`, [user.name, user.email, user.password])
  .then((res) => res.rows[0])
  .catch((err) => {
    console.log(err)
    return null;
  });
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return pool
  .query(`SELECT reservations.*, properties.*, avg(rating) AS average_rating
          FROM reservations 
          JOIN properties ON properties.id = property_id
          JOIN property_reviews ON reservations.id = reservation_id
          JOIN users ON users.id = properties.owner_id
          WHERE users.id = $1
          AND start_date > now()::date
          GROUP BY reservations.id, properties.id
          LIMIT $2;
          `, [guest_id, limit])
  .then((res) => res.rows)
  .catch((err) => {
    console.log(err)
    return null;
  });
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {
  return pool
    .query(`SELECT * FROM properties LIMIT $1;`, [limit])
    .then((res) => res.rows)
    .catch((err) => console.log(err.message));
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
