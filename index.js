const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let waitingUser = null;

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  if (waitingUser) {
    const room = `${waitingUser.id}#${socket.id}`;
    socket.join(room);
    waitingUser.join(room);

    socket.emit('chat message', 'You are connected with a new user.');
    waitingUser.emit('chat message', 'You are connected with a new user.');
    socket.emit('user connected', 'User is online');
    waitingUser.emit('user connected', 'User is online');

    waitingUser = null;
  } else {
    waitingUser = socket;
  }

  socket.on('chat message', (msg) => {
    const room = Array.from(socket.rooms).find((room) => room !== socket.id);
    if (room) {
      io.to(room).emit('chat message', { id: socket.id, text: msg, seen: false });
    }
  });


  socket.on('message seen', () => {
    const room = Array.from(socket.rooms).find((room) => room !== socket.id);
    if (room) {
      socket.to(room).emit('message seen');
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);

    if (waitingUser === socket) {
      waitingUser = null;
    } else {
      const room = Array.from(socket.rooms).find((room) => room !== socket.id);
      if (room) {
        const otherUser = Array.from(io.sockets.adapter.rooms.get(room) || []).find((id) => id !== socket.id);
        if (otherUser) {
          io.sockets.sockets.get(otherUser).leave(room);
          io.to(room).emit('chat message', 'User disconnected. The chat is now closed.');
          io.to(otherUser).emit('user disconnected', 'User has left the room');
        }
      }
    }
  });
});

server.listen(3000, () => {
  console.log('Listening on *:3000');
});
