const path = require("path");
const http = require("http");
const express = require("express");

const socketio = require("socket.io");
const { messages, messageLocation } =
require(__dirname + "/public/src/messages");
const { addUser, getUser, removeUser, getUsersInRoom } =
require(__dirname + "/public/src/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
app.use(express.static(__dirname + "/public"));

io.on("connection", socket => {
    console.log("New WebSocket Connection");
    socket.on("join", (args, callback) => {
        const { error, user } = addUser({ id: socket.id, ...args });
        if (error) {
            return callback(error);
        } else {
            socket.join(user.room);

            socket.emit("message", messages("Admin", "Welcome!"));
            socket.broadcast.to(user.room).emit("message", messages("Admin",
                user.username + " has joined"));
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
            callback();
        }
    })

    socket.on("sendMessage", (message, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit("message", messages(user.username, message));
        callback();

    });

    socket.on("sendLocation", (coords, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit("locationMessage",
            messageLocation(user.username, "https://www.google.com/maps?q=${coords.latitude},${coords.longitude}"));
        callback();
    });

    socket.on("disconnect", () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit("message", messages("Admin", user.username + " has left"));
            io.to(user.room).emit("roomData", {
                room: user.room,
                user: getUsersInRoom(user.room)
            });
        }
    })



});



server.listen(port, () => {
    console.log('Server is up on ' + port);
})