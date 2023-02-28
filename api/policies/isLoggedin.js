const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
/**
 * This is a middleware function.
 * @param {token} req
 * @return procced
 * @rejects {Error}
 */
module.exports = async (req, res, proceed) => {
  try {
    const token = req.session.jwt;
    /* This is checking if the token is valid or not. */
    console.log("===== this is auth middleware ======");
    console.log(req.session);
    console.log("====================================");
    const decoded = jwt.verify(token, process.env.SECRET);
    console.log(decoded);
    if (!req.session.user) {
      return res.redirect("login");
    }
    return proceed();
  } catch (error) {
    return res.redirect("/login");
  }
};
