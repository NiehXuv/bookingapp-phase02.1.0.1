const { createTripPlan } = require("./createTripPlan");
const { getTripPlan } = require("./getTripPlan");
const { getAllTripPlans } = require("./getAllTripPlans");
const { updateTripPlan } = require("./updateTripPlan");
const { deleteTripPlan } = require("./deleteTripPlan");

module.exports = {
  createTripPlan,
  getTripPlan,
  getAllTripPlans,
  updateTripPlan,
  deleteTripPlan
};
