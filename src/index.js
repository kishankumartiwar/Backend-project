import dotenv from "dotenv"
import connectDB from "./db/index.js";


// configuration for dotenv
dotenv.config({
  path: './env'
})

connectDB();// connecting to database  using db/index.js file
.then(() => {
  app.listen(process.env.PORT || 8000 , () => {
    console.log(`server is running at port ${process.env.PORT}`);
  })
})
.catch((err) =>{
  console.log("mongo db connection failed" , err );
})













































/* First approach to connect to database  
import mongoose, { connect } from  "mongoose";
import {DB_NAME} from "./constants";
import express from "express";
const app = express;

;( async ()=>{
  try{
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    app.on("error",(error)=>{
      console.log("error : " , error);
      throw error;
    })

    app.listen(process.env.PORT,() => {
      console.log(`app is listening on port ${process.env.PORT}`);
    })

  }catch(error){
    console.error("ERROR",error);
  }
  
})() */