const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const helmet = require("helmet");
const cors = require("cors");
const http = require("http");

require("dotenv").config();

const { PORT = 8080 } = process.env;

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(require("./routes"));

const server = http.createServer(app);

app.get("/", (req, res) =>
  res.status(200).json({
    message: "Server is up and running",
  })
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

require("./startup/logging")();
require("./startup/config")(app);
require("./startup/db")();

server.listen(PORT, () => console.log(`Server starting on port: ${PORT}`));
