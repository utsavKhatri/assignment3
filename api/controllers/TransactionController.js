/**
 * TransactionController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  getTrsansaction: async (req, res) => {
    try {
      const transactions = await Transaction.find();

      let incomeSum = 0;
      let expenss = 0;
      
      const incomeData = transactions.forEach((element) => {
        const h = element.amount;
        if (h < 0) {
          expenss += h;
        } else {
          incomeSum += h;
        }
      });

      res.view("pages/homepage", { data: transactions, incomeSum, expenss });
    } catch (error) {
      console.log(error.message);
      res.send(`message: ${error.message}`);
    }
  },
  addTrsansaction: async (req, res) => {
    try {
      const tID = req.params.tId;
      
      const newTransactions = await Transaction.create(req.body);
      res.redirect("/");
    } catch (error) {
      console.log(error.message);
      res.send(`message: ${error.message}`);
    }
  },
  rmTransaction: async (req, res) => {
    try {
      const transId = req.params.delId;
      const deletedAction = await Transaction.destroy({ id: transId });
      res.redirect("/");
    } catch (error) {
      console.log(error.message);
      res.send(`message: ${error.message}`);
    }
  },
};
