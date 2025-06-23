require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoute = require('./src/user/router');
const buzzerRoute = require('./src/buzzer/router');

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use("/buzzer/api", userRoute);
app.use("/buzzer/api", buzzerRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});
