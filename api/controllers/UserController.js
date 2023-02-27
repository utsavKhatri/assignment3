/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const { createToken, mailData } = require("../utils");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

module.exports = {
  /**
   * GET /login
   *
   * @description  This is a function render loginpage
   * @return {view} - render view loginpage
   */
  viewLogin: async (req, res) => {
    sails.log.info("you visit login page");
    res.view("pages/loginpage");
  },
  /**
   * GET /register
   *
   * @description  This is a function render signuppage
   * @return {view} - render view signuppage
   */
  viewSignup: async (req, res) => {
    sails.log.info("you visit signUp page");
    res.view("pages/signup");
  },

  /**
   * POST /login
   *
   * @description  This function is called when the user visits the login page.
   * @param {Object} req - email, password from body
   * @return {redirect} - redirect to  "/home"
   * @rejects {Error} - If failed log error
   */
  userLogin: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("====================================");
      console.log(email, password);
      console.log("====================================");
      // Check if user is already logged in
      if (req.session.user) {
        return res.redirect("/home");
      }

      // Check if user exists in the database
      const user = await User.findOne({ email });

      console.log("this user that search by emai =====");
      console.log(user);
      if (!user) {
        return res.status(401).json({ message: "Invalid email" });
      }

      // Check if the password is correct
      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return res.status(401).json({ message: "Invalid password" });
      }

      /* Creating a token and setting it to the session. */
      const token = createToken(user._id);

      sails.log.warn(token);

      req.session.jwt = token;

      console.log("this is cookie from session" + req.session.jwt);
      // Set the session data and redirect to homepage
      req.session.user = {
        _id: user.id,
        name: user.name,
        email: user.email,
      };
      /* Checking if the user is an admin or not. If the user is an admin, then it sets the session data and
  redirects to the homepage. */
      console.log(
        "============= thi is post login page ======================="
      );
      sails.log.info(req.session);
      console.log("====================================");

      return res.redirect("/home");
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  /**
   * POST /register
   *
   * @description  This is a function that is called when the user click signup on signup page.
   * @param {Object} req - name,email, password from body
   * @return {redirect} - redirect to  "/login"
   * @rejects {Error} - If failed log error
   */
  userSignup: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      console.log(name, email, password);

      // Check if user already exists in the database
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user in the database
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
      });
      const fetchedUser = await User.findOne({ email });
      /* Setting the session data. */
      req.session.user = {
        _id: fetchedUser.id,
        name: fetchedUser.name,
        email: fetchedUser.email,
      };

      console.log("====================================");
      console.log(req.session);
      console.log("====================================");

      let testAccount = await nodemailer.createTestAccount();
      let transporter = nodemailer.createTransport(mailData);

      let info = await transporter.sendMail({
        from: '"expense manager app" <expenseManager.com>', // sender address
        to: req.session.user.email, // list of receivers
        subject: "Welcome email", // Subject line
        text: "Hello world?", // plain text body
        html: `<b>hello ${req.session.user.name},\n You successfully create account in expense manager app</b>`, // html body
      });
      console.log("Message sent: %s", info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

      return res.redirect("/login");
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },
  /**
   * /logout
   *
   * @description  This is a function destroy session and logout user
   * @return {redirect} - redirect to  "/login"
   * @rejects {Error} - If failed log error
   */
  userLogout: async (req, res) => {
    req.session.destroy(() => {
      res.redirect("/");
    });
  },
  /**
   * GET /editProfile
   *
   * @description  This is a function render editProfile page for edit profile.
   * @param {String} req - email
   * @return {view} - render "pages/editprofile"
   * @rejects {Error} - If failed log error
   */
  editProfile: async (req, res) => {
    try {
      console.log(req.session);
      const email = req.session.user.email;
      const editUser = await User.findOne({ email });
      sails.log.warn(editUser);
      return res.view("pages/editprofile", { userDatam: editUser });
    } catch (error) {
      console.log(error.message);
    }
  },

  /**
   * POST /editProfile
   *
   * @description  This is a function update user data
   * @param {Object} req - session.user data
   * @return {redirect} - redirect to "/"
   * @rejects {Error} - If failed log error
   */
  updateProfile: async (req, res) => {
    try {
      const dmta = req.session.user;
      console.log("-------- this is old data --------");
      console.log(dmta.name);
      console.log("------ this is new data that update ----------");
      const newData = req.body.name;
      console.log(newData);
      console.log("----------------");
      const userId = req.session.user._id;

      const criteria = { _id: userId };
      const values = {
        name: req.body.name,
        email: req.body.email,
      };
      console.log(criteria, values);
      const updatedUser = await User.updateOne(criteria).set(values);

      console.log("------- this is updated data from above value ---------");
      console.log(updatedUser);
      console.log("----------------");

      req.session.user.name = await updatedUser.name;
      req.session.user.email = await updatedUser.email;
      return res.redirect("/");
    } catch (error) {
      console.log(error.message);
    }
  },

  /**
   * GET /about
   *
   * @description  This is a function render aboutpage
   * @return {view} - render view aboutpage
   */
  aboutPage: (req, res) => {
    res.view("pages/about");
  },
};
