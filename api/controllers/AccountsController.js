/**
 * AccountsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */




module.exports = {
  viewAccount:async(req,res)=>{
    try {
      const accData = await Accounts.find();
      res.view("pages/accountPage",{accData:accData})
    } catch (error) {
      console.log(error.message);
    }
  },
  addAccount:async(req,res)=>{
    try {
      const userId= req.params.userId;
      const user = await User.findOne({ id: userId });
      const newAccounts = await Accounts.create({name:req.body.name, owner:user.id});
      res.redirect("/viewAccount");
    } catch (error) {
      console.log(error.message);
    }
  },
};

