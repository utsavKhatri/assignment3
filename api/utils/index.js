var jwt = require('jsonwebtoken');

const maxAge = 3 * 24 * 60 * 60;
/**
 * It takes an id as an argument and returns a token that expires in 24 hours
 * @param id - The user's id
 * @returns A token is being returned.
 */
const createToken = (id) => {
  return jwt.sign({ id }, "utsav", {
    expiresIn: maxAge,
  });
};

module.exports={createToken}