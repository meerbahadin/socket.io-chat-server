const axios = require("axios");

const axiosClient = axios.create({
  baseURL: process.env.API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

module.exports = { axiosClient };
