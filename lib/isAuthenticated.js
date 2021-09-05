const jwt = require("jsonwebtoken");

module.exports = async (socket, next) => {
  const { ["x-user-token"]: authorization, key } = socket.handshake.headers;

  if (authorization && key) {
    try {
      const token = authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decodedToken;
      socket.user.auth = { token, key };
      next();
    } catch (error) {
      next(new Error("Invalid Token"));
    }
  } else {
    next(new Error("No token and key"));
  }
};
