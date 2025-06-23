require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoute = require('./src/user/router');
const buzzerRoute = require('./src/buzzer/router');
const roleRoute = require('./src/role/router');
const partieRoute = require('./src/partie/router');
const questionRoute = require('./src/question/router');
const themeRoute = require('./src/theme/router');

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use("/buzzer/api", userRoute);
app.use("/buzzer/api", buzzerRoute);
app.use("/buzzer/api", roleRoute);
app.use("/buzzer/api", partieRoute);
app.use("/buzzer/api", questionRoute);
app.use("/buzzer/api", themeRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});
