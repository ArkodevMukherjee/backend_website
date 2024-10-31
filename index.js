const { connectToMongo } = require("./connectToMongo");
const express = require("express");
require("dotenv").config();
const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const port = 3000;
connectToMongo();
const app = express();
const userCheck = require("./middlewares/userCheck");
const Blog = require("./Schemas/Blog");
const User = require("./Schemas/User");
const checkUser = require("./middlewares/userCheck");

app.use(express.json());

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false, // Use `true` for port 465, `false` for all other ports
//   auth: {
//     user: "",
//     pass: "",
//   },
// });

// async function otpGive(recieverEmail) {
//   // send mail with defined transport object

//   let otpksdkfs = otpGenerator.generate(6, {
//     upperCaseAlphabets: false,
//     specialChars: false,
//   });

//   const info = await transporter.sendMail({
//     from: "Website", // sender address
//     to: `${recieverEmail}`, // list of receivers
//     subject: "", // Subject line
//     text: `Your OTP is ${otpksdkfs}`, // plain text body
//   });

//   return otpksdkfs;

//   console.log("Message sent: %s", info.messageId);
//   // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
// }

app.get("/", (req, res) => {
  checkUser(req, res);

  res.status(200).json({ body: "success" });
});

// User Routes
app.post("/userAdd", async (req, res) => {
  const { username = null, email = null, password = null } = req.body;
  if (username == null || email == null || password == null) {
    res
      .status(400)
      .json({ body: "Either the username or email or password is null" });
  }

  // Email Unique
  else {
    const user = User.findOne({ email: email });
    console.log(user);
    if (user.username != undefined) {
      res.status(400).json({ body: "User already exits" });
    } else {
      let salt = await bcrypt.genSalt(10);
      let hashedPassword = await bcrypt.hash(password, salt);

      const data = {
        email: email,
        password: hashedPassword,
      };

      let userInsert = new User({
        username: username,
        email: email,
        password: hashedPassword,
        isVerified: false,
      });

      await userInsert.save();

      const token = jwt.sign(data, "Secret");
      res.status(200).json({ body: token });
    }
  }
});

app.post("/login", async (req, res) => {
  const { username = null, email = null, password = null } = req.body;

  if (username == null || email == null || password == null) {
    res
      .status(200)
      .json({ body: "Either the username or email or password is null" });
  } else {
    let user = await User.findOne({ email: email });
    if (user) {
      let password2 = user.password;

      let isValid = await bcrypt.compare(password, password2);

      if (isValid) {
        const data = {
          email: email,
          password: password,
        };
        const token = jwt.sign(data, "Secret");
        res.status(200).json({ body: token });
      } else {
        res.status(400).json({ body: "Wrong Password" });
      }
    } else {
      res.status(400).json({
        body: "User doesn't exist with this usrname or email or password or there is a mismatch between username or email or password",
      });
    }
  }
});

app.post("/blogSubmit", async (req, res) => {
  const { title = null, body = null } = req.body;

  const { email, password } = checkUser(req, res);

  let user = await User.findOne({ email: email });

  if (title == null || body == null) {
    res.status(400).json({ body: "Either the title or body is not given" });
  } else {
    let data = await Blog.insertMany({
      title: title,
      body: body,
      author: user._id,
    });
    res.status(200).json({ body: data });
  }
});

app.post("/update", async (req, res) => {
  const { id = null, title = null, body = null } = req.body;
  if (id == null) res.status(400).json({ body: "Id is missing from blog" });
  else {
    if (body == null) {
      let blog = await Blog.findById(id);
      if (!blog) {
        res.status(200).json({ body: "Blog does not exist" });
      } else {
        blog.title = title;
        res.status(200).json({ body: "Blog title has been modified" });
      }
    }

    if (title == null) {
      let blog = await Blog.findById(id);
      if (!blog) {
        res.status(400).json({ body: "Blog does not exist" });
      } else {
        blog.body = body;
        res.status(200).json({ body: "Blog title has been modified" });
      }
    }

    if (title != null && body != null) {
      let blog = await Blog.findById(id);
      if (!blog) {
        res.status(400).json({ body: "Blog does not exist" });
      } else {
        blog.title = title;
        blog.body = body;
        res.status(200).json({ body: "Blog title and body has been modified" });
      }
    }
  }
});

app.post("/delete", async (req, res) => {
  const { id = null } = req.body;
  if (id == null) {
    res.status(400).json({ body: "Id is not given " });
  } else {
    let blog = await Blog.findByIdAndDelete(id);
    res.status(200).json({ body: blog });
  }
});

app.listen(port, () => {
  console.log(`http://127.0.0.1:${port}`);
});
