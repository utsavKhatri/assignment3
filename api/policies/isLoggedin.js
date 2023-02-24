const jwt = require("jsonwebtoken");

/* This is a middleware function that is checking if the user is logged in or not. */
module.exports = async(req, res, proceed) => {
  try {
    const token = req.session.jwt;
    /* This is checking if the token is valid or not. */
    console.log("================ this is auth middleware ====================");
    console.log(req.session);
    console.log("====================================");
    const decoded = jwt.verify(token, "utsav");
    console.log(decoded);
    if (!req.session.user) {
      return res.redirect('login');
    }
    return proceed();
  } catch (error) {
    return res.redirect("/login");
  }
};
