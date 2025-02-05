const express = require("express");
const { Register, Login, GoogleCallback, GoogleRegister, Logout, Dashboard} = require("../controllers/auth.js");
const auth = require("../middlewares/auth");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { sendVerificationEmail, verifyToken } = require('../helpers/email.js'); // Import the email helper functions


router.post("/signup", Register)
router.post("/signin", Login);
// Email verification endpoint
router.get('/verify/:token', (req, res) => {
  const { token } = req.params;

  // Verify token and update user status
  verifyToken(token)
    .then(response => {
      res.status(200).send(response); // Successfully verified email
    })
    .catch(error => {
      res.status(400).send(error); // Invalid or expired token
    });
});
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/signin", session: false }),
(req, res) => {
  res.json({ message: "Successfully authenticated with google", token: req.user.token });

});
router.get("/logout", Logout);
router.get('/dashboard', auth, Dashboard);

module.exports = router;