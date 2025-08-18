const { getUserProfile } = require("./getUserProfile");
const { updateUserProfile } = require("./updateUserProfile");
const { updateAvatar } = require("./updateAvatar");
const { deleteUserProfile } = require("./deleteUserProfile");

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateAvatar,
  deleteUserProfile
};
