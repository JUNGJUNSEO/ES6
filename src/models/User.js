import mongoose from "mongoose";
import bcrypt from "bcrypt";
// 
const mongoUrl = process.env.DB_URL 
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
export default User;