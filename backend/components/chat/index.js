const { createChat } = require("./createChat");
const { sendMessage } = require("./sendMessage");
const { getChats } = require("./getChats");
const { getMessages } = require("./getMessages");
const { markChatAsRead } = require("./markChatAsRead");
const { searchUsers } = require("./searchUsers");

module.exports = {
  createChat,
  sendMessage,
  getChats,
  getMessages,
  markChatAsRead,
  searchUsers
};
