const { createTripPlan } = require("./createTripPlan");
const { getTripPlan } = require("./getTripPlan");
const { getAllTripPlans } = require("./getAllTripPlans");
const { updateTripPlan } = require("./updateTripPlan");
const { deleteTripPlan } = require("./deleteTripPlan");
const { generateTripPlan } = require("./generateTripPlan");

module.exports = {
  createTripPlan,
  getTripPlan,
  getAllTripPlans,
  updateTripPlan,
  deleteTripPlan,
  generateTripPlan
};
