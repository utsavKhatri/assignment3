/**
 * TransactionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  /**
   * GET /viewTransaction/:id
   *
   *
   * @description function getting the transactions of a specific account.
   * @param {Number} req - find transaction by id
   * @return {view} res - render "pages/homepage"
   * @rejects {Error} - If failed log error
   */

  getTrsansaction: async (req, res) => {
    try {
      const accountId = req.params.id;

      console.log("====================================");
      console.log(accountId);
      console.log("====================================");
      const account = await Accounts.findOne({ id: accountId }).populate(
        "transactions",
        { sort: "createdAt DESC" }
      );
      const transactions = account.transactions;

      console.log("====================================");
      console.log(account);
      console.log("====================================");

      let income = 0;
      let expenses = 0;

      const incomeData = transactions.forEach((element) => {
        const h = element.amount;
        if (h < 0) {
          expenses += h;
        } else {
          income += h;
        }
      });

      res.view("pages/homepage", {
        data: transactions,
        income,
        expenses,
        accountId,
        nameAccount: account.name,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).view("500",{error:error.message});
    }
  },

  /**
   * GET /viewTransaction/:id
   * @description function getting the transactions of a specific account.
   * @param {Number} req - find transaction by id
   * @return {view} res - render "pages/homepage"
   * @rejects {Error} - If failed log error
   */
  addTrsansaction: async (req, res) => {
    try {
      const tID = req.params.tId;
      const { text, amount, transfer, category } = req.body;
      console.log(
        "============ thi is add trans page ========================"
      );
      console.log(text, amount);
      console.log("====================================");
      const newTransactions = await Transaction.create({
        text,
        amount,
        transfer,
        category,
        account: tID,
      });
      res.redirect(`/viewTransaction/${tID}`);
    } catch (error) {
      console.log(error.message);
      res.status(500).view("500",{error:error.message});
    }
  },
  /**
   * GET /editTransaction/:id
   * @description function getting the transactions and render editTransaction page.
   * @param {Number} req - find transaction by id
   * @return {view} res - render "pages/editTransaction"
   * @rejects {Error} - If failed log error
   */
  editTransaction: async (req, res) => {
    const tId = req.params.id;
    try {
      const transactions = await Transaction.findOne({ id: tId });
      return res.view("pages/editTransaction", { data: transactions });
    } catch (error) {
      console.log(error.message);
      res.status(500).view("500",{error:error.message});
    }
  },
  /**
   * POST /editTransaction/:id
   * @description function update transaction data and redirect to home page
   * @param {Number} req - find transaction by id
   * @return {redirect} - redirect to  "/"
   * @rejects {Error} - If failed log error
   */
  updateTransaction: async (req, res) => {
    const tId = req.params.id;
    try {
      const criteria = { _id: tId };
      const values = req.body;
      console.log(criteria, values);
      const updatedTransaction = await Transaction.updateOne(criteria).set(
        values
      );
      return res.redirect("/home");
    } catch (error) {
      console.log(error.message);
      res.status(500).view("500",{error:error.message});
    }
  },
  /**
   * /rmTransaction/:delId
   * @description function delete transaction data and redirect to viewTransaction page
   * @param {Number} req - find transaction by id
   * @param {Object} req - accId from req.body
   * @return {redirect} - redirect to  "/viewTransaction/${accID}"
   * @rejects {Error} - If failed log error
   */
  rmTransaction: async (req, res) => {
    try {
      const transId = req.params.delId;
      const accID = req.body.accId;
      const deletedAction = await Transaction.destroy({ id: transId });
      res.redirect(`/viewTransaction/${accID}`);
    } catch (error) {
      console.log(error.message);
      res.status(500).view("500",{error:error.message});
    }
  },
};
