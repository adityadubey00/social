import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";
const app = express();
/* CONFIGURATIONS */
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
const __dirname = path.resolve();



// Add helmet middleware with CSP configuration
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'https://social-gjpw.onrender.com/'],
      // Add more directives as needed, such as:
       connectSrc: ["'self'", "https://social-gjpw.onrender.com/"],
    },
  })
);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use("/uploads", express.static( __dirname,"/uploads"));
// app.use("/public/assets", express.static(path.join(__dirname, "public", "assets")));
app.use('/uploads', express.static('/var/data/uploads'))
dotenv.config();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("common"));
}
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
/* FILE STORAGE */
if(process.env.NODE_ENV === "production"){
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cb(null, "/uploads");
    cb(null, path.join(__dirname, "client/build/assets"))
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }  
})
const upload = multer({ storage });
/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);
}
else{
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // cb(null, "/uploads");
      cb(null, path.join(__dirname, "client/public/assets"))
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    },
  });
  const upload = multer({ storage });
  /* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);
}


// /* ROUTES WITH FILES */
// app.post("/auth/register", upload.single("picture"), register);
// app.post("/posts", verifyToken, upload.single("picture"), createPost);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/* MONGOOSE SETUP */


// if (process.env.NODE_ENV === 'development') {
//   // set static folder 
//   const __dirname = path.resolve();
//   app.use('/assets', express.static('/var/data/public/assets'));
//   app.use(express.static(path.join(__dirname, '/client/build')));

//   // any route that is not api will be redirected to index.html
//   app.get('*', (req, res) =>
//     res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
//   );
//  } 
// else {
//   const __dirname = path.resolve();
//   app.use('/public/assets', express.static(path.join(__dirname, '/public/assets')));
//   app.get('/', (req, res) => {
//     res.send('API is running....');
//   });
// }



// const PORT = process.env.NODE_ENV === 'production' ? process.env.PORTA :process.env.PORTB;
const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  .then(() => {

      app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
    })
   
  

    /* ADD DATA ONE TIME */
    // User.insertMany(users);
    // Post.insertMany(posts);
  
  .catch((error) => console.log(`${error} did not connect`));
  // app.use(express.static(path.join(__dirname, "public", "assets")));

// Serve static files based on environment
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client", "build")));
  app.use('/uploads', express.static('/var/data/uploads'));
  app.use(express.static(path.join(__dirname, '/client/public/assets')));
  app.use(express.static(path.join(__dirname, '/uploads')));
 // app.use(express.static(path.join(__dirname, '/client/build')));
 app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  );
} else {
  app.use(express.static(path.join(__dirname, "client", "public")));
  app.get('/', (req, res) => {
       res.send('API is running....');
     });
}