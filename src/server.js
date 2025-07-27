import http from "http";
import { app, connectDB } from "./allFiles.js";
const server = http.createServer(app);

connectDB()
  .then(() => {
    const PORT = process.env.PORT || 7000;
    server.listen(PORT, () => {
      console.log(`SAZI server is running on port :${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed : ", err);
  });
