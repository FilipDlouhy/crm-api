const express = require("express");
const cors = require("cors"); // Import the cors middleware
const app = express();
const userRoutes = require("./Routes/UserRoutes");
const port = process.env.PORT || 7000;
const bodyParser = require("body-parser"); // Required to parse request body
const cookieParser = require("cookie-parser");

app.use(bodyParser.json()); // Parse JSON request body
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:8080", // Adjust this to your UI's origin
    credentials: true,
  })
);

app.use("/user", userRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
