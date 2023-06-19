const express = require('express')
const appController = require("../controllers/appController");
const isAuth = require("../middleware/is-auth");
const app = express.Router();

app.get("/", appController.landing_page);

// Login Page
app.get("/login", appController.login_get);
app.post("/login", appController.login_post);

// Register Page
app.get("/signup", appController.register_get);
app.post("/signup", appController.register_post);

//Resend confirmation email
app.get("/resendVerificationEmail/:email", appController.resendVerificationEmail_get);

// Verify
app.get("/api/auth/confirm/:confirmationCode", appController.verifyUser)
// //Reset Link
app.get("/api/auth/resetPassword/:confirmationCode", appController.resetPassword_get)
app.put('/resetPassword/:confirmationCode', appController.resetPassword_put)
// Forgot Password Page
app.get("/forgotPassword", appController.forgotPassword_get);
app.post("/forgotPassword", appController.forgotPassword_post);
// Dashboard Page
app.get("/files", isAuth, appController.dashboard_get);
//Logout User
app.post("/logout", isAuth, appController.logout_post);


module.exports = app;