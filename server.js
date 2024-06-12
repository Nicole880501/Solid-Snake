const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { onConnection, gameLoop } = require("./controllers/gameController");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

app.use(express.static("public"));

io.on("connection", (socket) => {
  onConnection(socket);
});

setInterval(() => {
  gameLoop(io);
}, 100);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
