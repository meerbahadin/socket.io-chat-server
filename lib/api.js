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
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0",
      Authorization: `Bearer ${token}`,
      key,
    },
  };
  try {
    return await axiosClient(options);
  } catch (error) {
    console.log(error);
    throw new Error("An error occurred");
  }
};

module.exports = { sendMessage };
