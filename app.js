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
import adminRouter from './components/admin/admin.router.js'
import workerRouter from './components/worker/worker.router.js'

import setupSwagger from './swagger.js'

app.get('/', (req, res) => {
  res.send('Hello World!')
})
setupSwagger(app);
app.use('/api/v1/student',studentRouter);
app.use('/api/v1/issue',issueRouter);
app.use('/api/v1/admin',adminRouter);
app.use('/api/v1/worker',workerRouter);

export {app}