const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { onConnection, gameLoop } = require("./controllers/gameController");

const app = express();
const path = require("path");
const server = http.createServer(app);
const io = socketIo(server);

const dotenv = require("dotenv");
dotenv.config();

const userRoutes = require("./routes/user");
const recordRoutes = require("./routes/record");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));

app.use("/user", userRoutes);
app.use("/record", recordRoutes);

app.get("/signin", async (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signin.html"));
});
app.get("/signup", async (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});
app.get("/game", async (req, res) => {
  res.sendFile(path.join(__dirname, "public", "game.html"));
});

io.on("connection", (socket) => {
  onConnection(socket);
});

setInterval(() => {
  gameLoop(io);
}, 10);

server.listen(process.env.PORT || 4000, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
