const express = require("express");
const { Register, Login, GoogleCallback, GoogleRegister, Logout, Dashboard} = require("../controllers/auth.js");
const auth = require("../middlewares/auth");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { sendVerificationEmail, verifyToken } = require('../helpers/email.js'); // Import the email helper functions

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: 'object'
 *       required:
 *         - username
 *         - email
 *       properties:
 *         username:
 *           type: 'string'
 *           description: 'Name of the user'
 *         email:
 *           type: 'string'
 *           description: 'Email of the user'
 *         password:
 *           type: 'string'
 *           description: 'Password of the user'
 *       example:
 *         username: 'John Doe'
 *         email: 'johndoe@gmail.com'
 *         password: 'password'
 *   
 */
/**
 * @swagger
 * components:
 *  securitySchemes:
 *   googleOAuth:
 *    type: oauth2
 *    flows:
 *      authorizationCode:
 *        authorizationUrl: https://accounts.google.com/o/oauth2/auth
 *        tokenUrl: https://oauth2.googleapis.com/token
 *        scopes:
 *          profile: Grant access to the "Profile" scope
 *          email: Grant access to the "Email" scope
 * 
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and registration API
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User' 
 *     responses:
 *       200:
 *         description: Verification email sent
 *       400:
 *         description: Error sending email
 *       401:
 *         description: Error registering user
 */


router.post("/signup", Register)

/**
 * @swagger
 * /auth/verify/{token}:
 *   get:
 *     tags: [Auth]
 *     summary: Verify user email
 *     description: User email verification endpoint
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token to verify user email
 *     responses:
 *       200:
 *         description: Successfully verified email
 *       400:
 *         description: Invalid or expired token
 *       401:
 *         description: Error verifying email
 *       500:
 *         description: Error sending email
 *  
 */

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

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     tags: [Auth]
 *     summary: Login as a user
 *     description: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: 
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string 
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in successfully
 *         content:
 *           application/json:
 *             schema:  
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string   
 *       400:  
 *         description: Please verify your email before logging in
 *       401:
 *         description: Incorrect email or password 
 * 
 */

router.post("/signin", Login);
// Email verification endpoint
// /**
//  * @swagger
//  * /auth/google:
//  *   get:
//  *     tags: [Auth]
//  *     summary: Authenticate with google
//  *     description: Signing in with google
//  *     operationId: googleAuth
//  *     security: 
//  *       - googleOAuth: []
//  *     responses:
//  *       302:
//  *         description: Redirecting to Google authentication page
//  * 
//  */
/**
 * @swagger
 * /auth/google:
 *   get:
 *     tags: [Auth]
 *     security:
 *       - googleOAuth: []
 *     summary: Redirects the user to Google OAuth for authentication
 *     description: Initiates Google authentication and redirects users to Google's consent screen.
 *     responses:
 *       "302":
 *         description: Redirect to Google's OAuth 2.0 login
 */
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))

// /**
//  * @swagger
//  * /auth/google/callback:
//  *   get:
//  *     tags: [Auth]
//  *     summary: Google authentication callback
//  *     description: Google authentication callback
//  *     operationId: googleCallback
//  *     security: 
//  *      - googleOAuth: []
//  *     responses:
//  *       200:
//  *         description: Successfully authenticated with google 
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 message:
//  *                   type: string
//  *                 token: 
//  *                   type: string
//  */
/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Handles Google OAuth callback
 *     description: Receives the authentication response from Google and logs in or registers the user.
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Authorization code returned by Google
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         required: false
 *         description: CSRF protection state parameter
 *     security:
 *      - googleOAuth: []
 *     responses:
 *       "200":
 *         description: Successfully authenticated with Google
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully authenticated with google"
 *                 token:
 *                   type: string
 *                   example: "your-jwt-token-here"
 *       "400":
 *         description: Bad request if authentication fails
 *       "500":
 *         description: Internal server error
 */
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/signin", session: false }),
(req, res) => {
  res.status(200).json({ message: "Successfully authenticated with google", token: req.user.token });

});
router.get("/logout", Logout);
router.get('/dashboard', auth, Dashboard);

module.exports = router;