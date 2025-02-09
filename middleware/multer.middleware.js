import multer from "multer";
import { BSON } from "bson";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, "./public/temp")
//     },
//     filename: function (req, file, cb) {
      
//       cb(null, file.originalname)
//     }
//   })

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      const fileName =
        Date.now() +
        "-" +
        new BSON.ObjectId() +
        "-" +
        file.originalname +
        "." +
        file.originalname.split(".").slice(-1);
      cb(null, fileName);
    },
    limits: { fileSize: 26214400 },
  });
  
export const upload = multer({ 
    storage, 
})