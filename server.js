const mongoose = require("mongoose");
const authRoute = require("./routes/userAuth");
const taskRoute = require("./routes/task");
const cors = require("cors");
const express = require("express");

const app = express();
require("dotenv").config();

app.use(express.json());
app.use(cors());

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("DB Connection Successfull"))
    .catch((err) => {
        console.log("DB Connection Failed");
        console.log(err);
    });

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/task", taskRoute);

app.use("*", (req, res) => {
    res.status(404).json({ message: "Route not found" });
  });
  
app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).json({ errorMessage: "Something went wrong" });
  });
  
  const port = process.env.PORT || 3000;
  
  app.listen(port, () => {
    console.log(`Backend server running on ${port}`);
  });
  