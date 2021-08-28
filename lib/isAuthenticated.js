const jwt = require("jsonwebtoken");

module.exports = async (socket, next) => {
  const { token, key } = socket.handshake.headers;

  if (token && key) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (error) {
      next(new Error("Invalid Token"));
    }
  } else {
    next(new Error("No token and key"));
  }
};
