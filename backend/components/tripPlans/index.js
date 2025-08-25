const { createTripPlan } = require("./createTripPlan");
const { getTripPlan } = require("./getTripPlan");
const { getAllTripPlans } = require("./getAllTripPlans");
const { updateTripPlan } = require("./updateTripPlan");
const { updateActivityTime } = require("./updateActivityTime");
const addActivity = require("./addActivity");
const { deleteTripPlan } = require("./deleteTripPlan");
const { generateTripPlan } = require("./generateTripPlan");

module.exports = {
  createTripPlan,
  getTripPlan,
  getAllTripPlans,
  updateTripPlan,
  updateActivityTime,
  addActivity,
  deleteTripPlan,
  generateTripPlan
};
