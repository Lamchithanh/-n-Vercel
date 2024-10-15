const express = require("express");
const path = require("path");

const configViewEngine = (app) => {
    app.set("views", path.join("./src", "views"));
    app.set("view engine", "ejs");
    app.use(express.static(path.join(__dirname, "public"))); // Fixed: changed user to use
    
};

module.exports = configViewEngine;
