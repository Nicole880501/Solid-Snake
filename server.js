const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { onConnection, gameLoop } = require("./controllers/gameController");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const dotenv = require("dotenv");
dotenv.config();

const userRoutes = require("./routes/user");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/user", userRoutes);

io.on("connection", (socket) => {
  onConnection(socket);
});

setInterval(() => {
  gameLoop(io);
}, 10);

server.listen(process.env.PORT || 4000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
