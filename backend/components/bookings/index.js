const { createBooking } = require("./createBooking");
const { getBooking } = require("./getBooking");
const { getAllBookings } = require("./getAllBookings");
const { updateBooking } = require("./updateBooking");
const { deleteBooking } = require("./deleteBooking");

module.exports = {
  createBooking,
  getBooking,
  getAllBookings,
  updateBooking,
  deleteBooking
};
