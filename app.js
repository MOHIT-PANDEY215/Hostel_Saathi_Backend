import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'

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


import studentRouter from './components/student/student.router.js'
import issueRouter from './components/issues/issues.router.js'

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.use('/api/v1/student',studentRouter);
app.use('/api/v1/issue',issueRouter);

export {app}