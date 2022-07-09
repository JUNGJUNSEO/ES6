import 'dotenv/config'
import express from "express";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import { getJoin, postJoin, getLogin, postLogin, logout } from "./controllers/useController";
import {localsMiddleware, protectorMiddleware} from "./middlewares"

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
app.use(localsMiddleware);
app.use("/public", express.static(__dirname + "/public"));
app.route("/").get(getLogin).post(postLogin);
app.get("/logout",protectorMiddleware, logout)
app.route("/join").get(getJoin).post(postJoin)


const handleListening = () =>
  console.log(`✅ Server listenting on http://localhost:4000 🚀`);
app.listen(4000, handleListening);