import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Server } from "socket.io";
import config from "dotenv/config";

const app = express();
const server = createServer(app);
const io = new Server(server);

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.set("views", join(__dirname, "./views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

const OnlineUsers = {}

io.on("connection", (socket) => {
  console.log(socket.id);
  console.log("a user connected");

  socket.on("new-message", (data) => {
    const newMessage = { id: 1, descrtiption: data };
    socket.broadcast.emit("new-message", newMessage);
  });

  socket.on("new-message-one", (data) => {
    socket.to(data.userId).emit("new-message-one", data)
  });

  socket.on("users", (data) => {
    OnlineUsers[socket.id] = data;
    const onlineUsers = Object.keys(OnlineUsers).length
    socket.emit("users", onlineUsers)
  })

  socket.on("disconnect", () => {
    delete OnlineUsers[socket.id]
  });
});

const PORT = process.env.PORT || 3030;

server.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
