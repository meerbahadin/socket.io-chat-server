require("dotenv").config();
const jwt = require("jsonwebtoken");
const isAuthenticated = require("./lib/isAuthenticated");
const { sendMessage } = require("./lib/api");
const { instrument } = require("@socket.io/admin-ui");

const io = require("socket.io")(process.env?.PORT || 5000, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

io.use(async (socket, next) => {
  await isAuthenticated(socket, next);
});

// Converting this to redis in the future for better scalability
const activeClients = [];

io.on("connection", async (socket) => {
  const { token, key } = socket.handshake?.headers;
  const decodedToken = jwt.verify(token, process.env?.JWT_SECRET);
  const userId = decodedToken?.sub.toString();
  activeClients.push(userId);

  /* Every user will listen to thier channel so recive thier messages,
   or send messages to other users */
  socket.join(userId);

  socket.on("send-message", async ({ reciver_id, message }) => {
    if (!reciver_id || !message) {
      return socket.emit("error", "Reciver id and message is required");
    }

    try {
      /**
       * Sending the message to the API before broadcasting
       *
       * @route POST api/send/messagge
       * @access Private
       */

      const res = await sendMessage({
        message,
        reciver_id,
        token,
        key,
      });

      /*
       * Broadcasting the message if API response is 200 (SUCCESS)
       */

      const reciver = `${reciver_id}`;

      if (res?.status === 200) {
        if (!activeClients.includes(reciver)) return;
        return socket.broadcast.to(reciver).emit("receive-message", {
          message,
          reciver_id,
          userId,
        });
      }
    } catch (error) {
      socket.emit("error", "SOCKET_ERROR");
    }
  });

  socket.on("disconnect", function () {
    socket.leave(userId);
    const removeIndex = activeClients.map((item) => item).indexOf(userId);
    activeClients.splice(removeIndex, 1);
  });
});

instrument(io, {
  auth: {
    type: "basic",
    username: process.env?.ADMIN_USERNAME,
    password: process.env?.ADMIN_PASSWORD,
  },
});
