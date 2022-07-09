import 'dotenv/config'
import express from "express";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import { getJoin, postJoin, getLogin, postLogin } from "./controllers/useController";

const app = express();
// template engine으로 pug를 사용할 것을 명시함.
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);
app.use(flash());
app.route("/").get(getJoin).post(postJoin);
app.route("/login").get(getLogin).post(postLogin)


const handleListening = () =>
  console.log(`✅ Server listenting on http://localhost:5000 🚀`);
app.listen(5000, handleListening);