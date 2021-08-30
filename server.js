require("dotenv").config();
const httpServer = require("http").createServer();
const isAuthenticated = require("./lib/isAuthenticated");
const { sendMessage } = require("./lib/api");
const { instrument } = require("@socket.io/admin-ui");

const options = {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
};

const io = require("socket.io")(httpServer, options);

io.use(async (socket, next) => {
  await isAuthenticated(socket, next);
});

// Converting this to redis in the future for better scalability
const activeClients = [];

io.on("connection", async (socket) => {
  const userId = `${socket?.user?.sub}`;
  const { token, key } = socket?.user?.auth;

  /* Every user will listen to thier channel so recive thier messages,
   or send messages to other users */

  socket.join(userId);
  activeClients.push(userId);

  socket.on("message:send", async ({ receiver_id, message }) => {
    if (!receiver_id || !message) {
      return socket.emit("error", "The receiver_id and message is required");
    }

    try {
      /**
       * Sending the message to the API before broadcasting
       * @route POST api/send/messagge
       * @access Private
       */

      const res = await sendMessage({
        message,
        receiver_id: +receiver_id,
        token,
        key,
      });

      /*
       * Broadcasting the message if API response is 200 (SUCCESS)
       */

      if (res?.status === 200) {
        if (!activeClients.includes(receiver_id)) return;
        return socket.broadcast.to(receiver_id).emit("message:receive", {
          message,
          receiver_id,
        });
      }
    } catch (error) {
      socket.emit("error", "SOCKET_ERROR");
    }
  });

  socket.on("message:delete", ({ receiver_id }) => {
    socket.broadcast.to(receiver_id).emit("message:update");
  });

  socket.on("disconnect", () => {
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

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => console.log(`Server is listening on ${PORT}`));
