const { createNotification } = require("./createNotification");
const { getNotifications } = require("./getNotifications");
const { markAsRead } = require("./markAsRead");
const { markAllAsRead } = require("./markAllAsRead");
const { deleteNotification } = require("./deleteNotification");

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
