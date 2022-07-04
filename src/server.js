import express from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
// 
const mongoUrl = "mongodb://127.0.0.1:27017/ES6"
mongoose.connect(mongoUrl);
const db = mongoose.connection;

const handleOpen = () => console.log("✅ Connected to DB");
const handleError = (error) => console.log("❌ DB Error", error);

db.on("error", handleError);
db.once("open", handleOpen);

//Defining my schema
const userSchema = new mongoose.Schema({
  avatarUrl: String,
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String },
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});

//Creating a model
const User = mongoose.model("User", userSchema);

const app = express();
// template engine으로 pug를 사용할 것을 명시함.
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "정준",
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: mongoUrl }),
  })
);
app.route("/").get(
    (_, res)=>{
        return res.render("join")
    }
).post(async (req, res) => {
        const { name, username, email, password, password2} = req.body;
        // 비밀 번호가 틀렸을 경우 errorMessage를 송출.
        if (password !== password2) {
          return res.status(400).render("join", {
            errorMessage: "Password confirmation does not match.",
          });
        }
        // username과 email이 존재할 경우 errorMessage를 송출.
        const exists = await User.exists({ $or: [{ username }, { email }] });
        console.log(exists)
        if (exists) {
          return res.status(400).render("join", {
            errorMessage: "This username/email is already taken.",
          });
        }
        try {
            await User.create({
              name,
              username,
              email,
              password,
            });
            return res.redirect("/");
          } catch (error) {
            return res.status(400).render("join", {
              errorMessage: error._message,
            });
          }
        }
);

app.route("/login").get(
    (_, res) => res.render("login")
).post(async (req, res) => {
        const { username, password } = req.body;
        const user = await User.findOne({username});
        if (!user) {
          return res.status(400).render("login", {
            errorMessage: "An account with this username does not exists.",
          });
        }
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
          return res.status(400).render("login", {
            errorMessage: "Wrong password",
          });
        }
        req.session.loggedIn = true;
        req.session.user = user;
        return res.send("you are logged in");
      }
)


const handleListening = () =>
  console.log(`✅ Server listenting on http://localhost:5000 🚀`);
app.listen(5000, handleListening);