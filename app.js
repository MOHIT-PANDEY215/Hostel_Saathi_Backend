import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middleware/error.middleware.js'

dotenv.config()

const app =express()


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(errorHandler);

// The below handlers are for uncaught exceptions and unhandled promise rejections. They log the error and exit the process to prevent the server from running in an unstable state.

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err.message);
  process.exit(1);
});


import setupSwagger from './swagger.js'
import routesInit from './routes.js'
setupSwagger(app);

routesInit(app);

export {app}