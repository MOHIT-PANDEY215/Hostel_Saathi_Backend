import dotenv from "dotenv"
import {app} from './app.js'
import mongoose from "mongoose";
dotenv.config({
    path: './.env'
})

app.get("/", (_req, res) => {
  res.json({ data: "Hello world" });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});


const MONGO_URI=process.env.MONGO_URI
const port = process.env.PORT

mongoose.connect(MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(port,"0.0.0.0", () => {
        console.log(`Hostel Saathi listening on port ${port}`)
      })
    console.log('MongoDB connected')
  })
  .catch(err => console.error('MongoDB connection error:', err));



