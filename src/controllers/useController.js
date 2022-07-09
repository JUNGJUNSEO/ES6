import User from "../models/User"
import bcrypt from "bcrypt";


// 로그인
export const getLogin = (_, res) => res.render("home")
export const postLogin = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({username});
    if (!user) {
      return res.status(400).render("home", {
        errorMessage: "An account with this username does not exists.",
      });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).render("home", {
        errorMessage: "Wrong password",
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
}

// 로그 아웃
export const logout = (req, res) => {
  req.flash("info", "Bye Bye");
  req.session.destroy();
  return res.redirect("/");
};


// 회원 가입
export const getJoin = (_, res)=> res.render("join")
export const postJoin = async (req, res) => {
    const { name, username, email, password, password2} = req.body;
    // 비밀 번호가 틀렸을 경우 errorMessage를 송출.
    if (password !== password2) {
        req.flash("info", "Password confirmation does not match.")
        return res.status(400).render("join", {
            errorMessage: "Password confirmation does not match.",
      });
    }
    // username과 email이 존재할 경우 errorMessage를 송출.
    const exists = await User.exists({ $or: [{ username }, { email }] });
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

