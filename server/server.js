const express = require("express");
const connectDB = require("./config/database");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const initializeSocket = require("./sockets/socket");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);

app.use(
  cors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 4000;
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');

app.get('/', (req, res) => {
  res.send('Home Page!');
});

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    server.listen(PORT, () => {
      console.log("Server started successfully at port: ", PORT);
    });
  })
  .catch((err) => {
    console.log("Database not connected:", err);
  });