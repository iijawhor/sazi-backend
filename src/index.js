import dotenv from "dotenv";
import connectDB from "./db/db.js";
import express from "express";
import { app } from "./app.js";
dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 4000, () => {
      console.log(`server is running on port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed...");
  });

// ;(async () => { instead if this connect in another file it will be good approach in db.js
//     try {
//        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//        app.on('error',()=>{
//         console.log("ERROR :",error);
//         throw error
//        })
//        app.listen(process.env.PORT,()=>{
//         console.log(`app is listening on port ${process.env.PORT}`);
//        })
//     } catch (error) {
//         console.error("ERROR: ",error)
//     }
// })();
