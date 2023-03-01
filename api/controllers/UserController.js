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
    res.view("pages/loginpage", { error: false });
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
        return res
          .status(401)
          .view("pages/loginpage", { message: "Invalid Email", error: true });
      }

      // Check if the password is correct
      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return res
          .status(401)
          .view("pages/loginpage", {
            message: "Invalid Password",
            error: true,
          });
      }

      /* Creating a token and setting it to the session. */
      const token = createToken(user._id);

      sails.log.warn(token);

      req.session.jwt = token;

      console.log("this is cookie from session " + req.session.jwt);
      // Set the session data and redirect to homepage
      req.session.user = {
        _id: user.id,
        name: user.name,
        email: user.email,
      };
      /* Checking if the user is an admin or not. If the user is an admin, then it sets the session data and
  redirects to the homepage. */
      
      console.log("====================================");
      sails.log.info(req.session);

      return res.redirect("/home");
    } catch (error) {
      console.error(error);
      res.status(500).view("500", { error: error.message });
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

      const defaultAccount = await Accounts.create({
        name: `${fetchedUser.name} default account`,
        owner: fetchedUser.id,
      });
      console.log(defaultAccount);

      let transporter = nodemailer.createTransport(mailData);

      let info = transporter.sendMail({
        from: '"expense manager app" <expenseManager.com>', // sender address
        to: req.session.user.email, // list of receivers
        subject: "Welcome email", // Subject line
        text: "Hello world?", // plain text body
        html: `<b>hello ${req.session.user.name},\n You successfully create account in expense manager app</b>`, // html body
      });

      /* For testing email sending. */
      console.log("Message sent: %s", info.messageId);

      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

      return res.redirect("/login");
    } catch (error) {
      console.error(error);
      res.status(500).view("500", { error: error.message });
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
      res.redirect("/login");
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
      res.status(500).view("500", { error: error.message });
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
      const newData = req.body.name;
      const userId = req.session.user._id;

      const criteria = { _id: userId };
      const values = {
        name: req.body.name,
        email: req.body.email,
      };
      console.log(criteria, values);
      const updatedUser = await User.updateOne(criteria).set(values);
      
      console.log("Updated User",updatedUser);
      
      req.session.user.name = await updatedUser.name;
      req.session.user.email = await updatedUser.email;
      return res.redirect("/home");
    } catch (error) {
      console.log(error.message);
      res.status(500).view("500", { error: error.message });
    }
  },
  /**
   * GET /delUser/:id
   *
   * @description  This is a function delete user
   * @param {Number} id - get id of user from params
   * @return {redirect} - redirect to "/login"
   * @rejects {Error} - If failed log error
   */
  delUser: async (req, res) => {
    const id = req.params.id;
    try {
      const delAcc = await Accounts.destroy({ owner: id });
      const delUser = await User.destroy({ id: id });
      return req.session.destroy(() => {
        res.redirect("/login");
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).view("500", { error: error.message });
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
