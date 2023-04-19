const express = require('express')
const config = require("config");

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

// Dashboard Page
app.get("/files", isAuth, appController.dashboard_get);

app.post("/logout", isAuth, appController.logout_post);

module.exports = app;