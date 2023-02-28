/**
 * AccountsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const nodemailer = require("nodemailer");
const { mailData } = require("../utils");

module.exports = {
  /**
   * GET /home
   * @description - A function that is used to view account page.
   * @param {Number} req - The userId of the user creating the account.
   * @return {Object} accData, sharedAccounts - The account data.
   * @rejects {Error} - If the account could not be created.
   */

  viewAccount: async (req, res) => {
    try {
      const userId = req.session.user._id;
      const user = await User.findOne({ id: userId });
      const accData = await Accounts.find({ owner: userId }).populate("owner");
      const amcData = await Accounts.find().populate("owner");

      // This is a filter function that is used to filter the shared account with the user.
      const sharedAccounts = amcData.filter((account) => {
        return account.sharedWith.some(
          (sharedUser) => sharedUser.id === user.id
        );
      });

      console.log(sharedAccounts, accData);

      res.view("pages/accountPage", {
        accData: accData,
        sharedAccounts: sharedAccounts,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).view("500",{error:error.message});
    }
  },

  /**
   * POST /addAccount/:userId
   * @description - This is a function that is used to create an account.
   * @param {Object} req - name get from req.body to creare account
   * @return {account} object - The account data.
   * @redirect "/"
   * @rejects {Error} - If the account could not be created.
   */
  addAccount: async (req, res) => {
    const { name } = req.body;
    console.log("================ accounts create page ====================");
    console.log(req.body);
    const id = req.session.user._id;
    /* This is a try catch block. It is used to catch errors. */
    try {
      const account = await Accounts.create({ name, owner: id });
      console.log(account);
      res.redirect("/home");
    } catch (error) {
      console.log(error.message);
      res.status(500).view("500",{error:error.message});
    }
  },
  /**
   * GET /editAccount/:id
   * @description - This is a function that is used redirect user to editaccountpage.
   * @param {Number} req - id from params for search data
   * @return {view} render "pages/editAccount" with accountData
   * @rejects {Error} - If the account could not be created.
   */

  editAccount: async (req, res) => {
    const accId = req.params.id;
    try {
      const accountData = await Accounts.findOne({ id: accId });
      res.view("pages/editAccount", { data: accountData });
    } catch (error) {
      console.log(error.message);
      res.status(500).view("500",{error:error.message});
    }
  },
  /**
   * POST /editAccount/:id
   * @description - This is a function that is used to update accountdata
   * @param {Number} req - id from params for search data
   * @return {redirect} redirect to "/"
   * @rejects {Error} - If the account could not be created.
   */
  updateAccount: async (req, res) => {
    const accountId = req.params.id;
    try {
      const criteria = { _id: accountId };
      const values = req.body;
      console.log(criteria, values);
      const updatedAccount = await Accounts.updateOne(criteria).set(values);
      return res.redirect("/home");
    } catch (error) {
      console.log(error.message);
      res.status(500).view("500",{error:error.message});
    }
  },

  /**
   * /delAccount/:accId
   * @description function that deletes an account with the specified ID, as well as any associated transactions, and then redirects to the home page.
   * @param {Object} req - The request object.
   * @param {redirect} res - redirect to "/"
   * @param {string} req.params.accId - The ID of the account to be deleted.
   */
  delAccount: async (req, res) => {
    const id = req.params.accId;
    try {
      const delTrans = await Transaction.destroy({ account: id });
      const delacc = await Accounts.destroy({ id: id });
      res.redirect("/home");
    } catch (error) {
      console.log(error.message);
      res.status(500).view("500",{error:error.message});
    }
  },
  /**
   * /share/:id
   *
   * retrieves information about a specified account, as well as a list of all users, and renders a view to share the account with other users.
   * @param {Object} req - id get from params for share purpose
   * @param {view} res - render pages/homepge
   * @rejects {Error} - If the account could not be retrieved.
   */

  share: async (req, res) => {
    try {
      console.log("get share page", req.params.id);
      const account = await Accounts.findOne({
        id: req.params.id,
        owner: req.session.user._id,
      });
      const sharedList = account.sharedWith;
      const users = await User.find();
      return res.view("pages/shareAccountpage", { account, users, sharedList });
    } catch (error) {
      console.log(error.message);
      res.status(500).view("500",{error:error.message});
    }
  },

  /**
   * POST /account/share/:id
   *
   * This function is used to share account with other user.
   * @param {Object} req - id get from params and email from body for share purpose
   * @param {redirect} res - redirect to "/"
   * @rejects {Error} - If failed to share.
   */

  shareAccount: async (req, res) => {
    try {
      const accountId = req.params.id;
      const sharedWithEmail = req.body.email;

      console.log("post share account page", accountId, sharedWithEmail);

      // Find the account by ID and ensure that the currently authenticated user is the owner
      const account = await Accounts.findOne({
        id: accountId,
        owner: req.session.user._id,
      });

      console.log("exitis account", account);

      const sharedWithUser = await User.findOne({ email: sharedWithEmail });

      account.sharedWith = [...account.sharedWith, sharedWithUser];
      // Add the user to the account's sharedWith array
      const latestData = await Accounts.updateOne({ id: accountId }).set({
        sharedWith: account.sharedWith,
      });

      /* This is a function that is used to send email to the user. */
      let transporter = nodemailer.createTransport(mailData);

      let info = transporter.sendMail({
        from: '"expense manager app" <expenseManager.com>', // sender address
        to: req.session.user.email, // list of receivers
        subject: "Account shared", // Subject line
        text: "Hello world?", // plain text body
        html: `<b>hello ${req.session.user.name}</b>,<br/><span>You successfully share your account <b>${latestData.name}</b> to ${req.body.email}</span>`, // html body
      });

      let sharedAcc = transporter.sendMail({
        from: '"expense manager app" <expenseManager.com>', // sender address
        to: req.body.email, // list of receivers
        subject: "Account shared", // Subject line
        text: "Hello world?", // plain text body
        html: `<b>hello ${req.body.email}</b><br/><span>${req.session.user.email} sahre <b>${latestData.name}</b> account with you</span><br/><span>click to open shared account transaction page </span><a href="http://localhost:1337/viewTransaction/${latestData.id}">link</a>`, // html body
      });
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      console.log("Message sent: %s", info.messageId);

      console.log("Message sent: %s", info.sharedAcc);

      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(sharedAcc));
      return res.redirect("/home");
    } catch (error) {
      console.log(error.message);
      res.status(500).view("500",{error:error.message});
    }
  },
};
