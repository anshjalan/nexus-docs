const { Server } = require("socket.io");
const Document = require("../models/Document");
require("dotenv").config();

const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
      // console.log("User disconnected:", socket.id);
    });

    socket.on("join-document", (documentId) => {
      if (!documentId) return;
      socket.join(documentId);
      // console.log(`Socket ${socket.id} joined document ${documentId}`);
    });

    socket.on("leave-document", (documentId) => {
      if (!documentId) return;
      socket.leave(documentId);
      // console.log(`Socket ${socket.id} left document ${documentId}`);
    });

    socket.on("send-changes", ({ documentId, delta }) => {
      if (!documentId) return;

      socket.to(documentId).emit("receive-changes", delta);
    });

    socket.on("get-document", async (documentId) => {
      try {
        if (!documentId) return;
        const document = await Document.findById(documentId);

        if (!document) return;
        socket.emit("load-document", document.content);

      } catch (error) {
        console.error("Error loading document:", error.message);
      }
    });

    socket.on("save-document", async ({ documentId, content }) => {
      try {
        if (!documentId || content === undefined) return;

        await Document.findByIdAndUpdate(documentId, {
          content
        });

      } catch (error) {
        console.error("Error saving document:", error.message);
      }
    });

  });

  return io;
};

module.exports = initializeSocket;