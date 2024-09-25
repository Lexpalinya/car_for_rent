import { Server as SocketIOServer } from "socket.io";

const clients = new Map();
let io;

// Initialize Socket.IO and attach it to the server
export const initSocketServer = (server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    const client_id = socket.handshake.query.user_id;
    clients.set(client_id, socket);
    console.log(`Client Connected: ${client_id}`);

    socket.on("disconnect", () => {
      clients.delete(client_id);
      console.log(`Client Disconnected: ${client_id}`);
    });
  });
  console.log("object :>> ");
};

// Broadcast data to a specific client
export const broadcast = ({ client_id, ctx, data }) => {
  const clientSocket = clients.get(client_id);
  if (clientSocket) {
    // console.log("object :>>--------------------- ", data);
    clientSocket.emit(ctx, data);
  }
};
