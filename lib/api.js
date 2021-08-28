const axios = require("axios");
const API = process.env.API_URL;

const sendMessage = async ({ token, key, message, reciver_id }) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ${token}`,
      key,
    },
  };
  try {
    return await axios.post(
      `${API}/chat/send`,
      JSON.stringify({
        reciver_id,
        message,
      }),
      config
    );
  } catch (error) {
    throw new Error("An error occurred");
  }
};

module.exports = { sendMessage };
