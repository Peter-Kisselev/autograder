require("dotenv").config();
const session = require("express-session");
const express = require("express");
const app = express();
const port = 3000;
const gradeRouter = require("./routes/grade");
const adminRouter = require("./routes/admin");
const { populate } = require("./profile");
const useragent = require("express-useragent");

var favicon = require("serve-favicon");
app.use(favicon("./public/images/favicon.ico"));

app.use(express.static("./public"));
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);
app.use("/grade", gradeRouter);
app.use("/admin", adminRouter);
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  let source = req.headers["user-agent"];
  let ua = useragent.parse(source);
  if (ua.isMobile) {
    req.session.mobile = true;
    res.status(200);
    res.render("phone", {
      loginurl: "/grade/authlogin",
    });
  } else {
    req.session.mobile = false;
    res.status(200).render("index", {
      loginurl: "/grade/authlogin",
    });
  }
});

app.get("/start", async (req, res) => {
  if (req.session.user_data == undefined) {
    res.redirect("/");
  } else {
    deviceClass = "main";
    if (req.session.mobile) {
      deviceClass = "phone";
    }
    res.render("firstTime", {
      name: req.session.user_data.display_name,
      username: req.session.user_data.ion_username,
      device: deviceClass,
    });
  }
});

app.get("/megaknight", async (req, res) => {
  res.render("megaknight");
});

app.get("/megaknightmovement", async (req, res) => {
  res.render("megaknightmovement");
});

app.post("/confirm", async (req, res) => {
  user_data = req.session.user_data;
  user_data.email = req.body.email;
  user_data.pass = "1234"; //filler key
  //user_data.pass = req.body.pass; //this feature is not being used anymore
  try {
    if (req.body.email.length > 100) {
      res.send("Your input exceeds the limit");
    } else {
      populate(user_data, req, res);
    }
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

console.log("Application Started");
app.listen(port);
