const { axiosClient } = require("../utils/axiosClient");

const sendMessage = async ({ token, key, message, receiver_id }) => {
  const options = {
    method: "POST",
    url: "/chat/send",
    data: {
      receiver_id,
      message,
    },
    headers: {
      Authorization: `Bearer ${token}`,
      key,
    },
  };
  try {
    return await axiosClient(options);
  } catch (error) {
    throw new Error("An error occurred");
  }
};

module.exports = { sendMessage };
