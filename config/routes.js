/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
  /***************************************************************************
   *                                                                          *
   * Make the view located at `views/homepage.ejs` your home page.            *
   *                                                                          *
   * (Alternatively, remove this and add an `index.html` file in your         *
   * `assets` directory)                                                      *
   *                                                                          *
   ***************************************************************************/

  // "GET /": "UserController.viewPage",
  // "GET /home": "UserController.viewPage",

  // "GET /": "TransactionController.getTrsansaction",
  // "GET /home": "TransactionController.getTrsansaction",
  "GET /about": "UserController.aboutPage",
  "GET /login": "UserController.viewLogin",
  "GET /": "AccountsController.viewAccount",
  "GET /home": "AccountsController.viewAccount",
  "GET /register": "UserController.viewSignup",
  "GET /editProfile": "UserController.editProfile",
  "GET /editTransaction/:id": "TransactionController.editTransaction",
  "POST /editTransaction/:id": "TransactionController.updateTransaction",
  "GET /editAccount/:id": "AccountsController.editAccount",
  "POST /editAccount/:id": "AccountsController.updateAccount",
  
  "POST /login": "UserController.userLogin",
  "POST /register": "UserController.userSignup",
  "POST /editProfile": "UserController.updateProfile",
  "POST /addTransaction/:tId": "TransactionController.addTrsansaction",
  "POST /addAccount/:userId": "AccountsController.addAccount",
  "POST /account/share/:id": "AccountsController.shareAccount",
  
  "/viewTransaction/:id": "TransactionController.getTrsansaction",
  "/logout": "UserController.userLogout",
  "/rmTransaction/:delId": "TransactionController.rmTransaction",
  "/share/:id": "AccountsController.share",
  "/delAccount/:accId": "AccountsController.delAccount",
  /***************************************************************************
   *                                                                          *
   * More custom routes here...                                               *
   * (See https://sailsjs.com/config/routes for examples.)                    *
   *                                                                          *
   * If a request to a URL doesn't match any of the routes in this file, it   *
   * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
   * not match any of those, it is matched against static assets.             *
   *                                                                          *
   ***************************************************************************/
};
