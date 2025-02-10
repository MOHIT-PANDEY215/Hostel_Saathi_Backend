import dotenv from "dotenv"
import {app} from './app.js'
import mongoose from "mongoose";
dotenv.config({
    path: './.env'
})



const MONGO_URI=process.env.MONGO_URI
const port = process.env.PORT

mongoose.connect(MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(port, () => {
        console.log(`Hostel Saathi listening on port ${port}`)
      })
    console.log('MongoDB connected')
  })
  .catch(err => console.error('MongoDB connection error:', err));



