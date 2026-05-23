require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const connectDB = require("./config/db");
const { authGuard } = require("./middleware/auth");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerOptions = require("./config/swagger");

const accountRoutes = require("./routes/account.routes");
const jobRoutes = require("./routes/job.routes");
const adminRoutes = require("./routes/admin.routes");
const policyRoutes = require("./routes/policy.routes");
const claimRoutes = require("./routes/claim.routes");

const typelistRoutes = require("./routes/typelist.routes");

const app = express();

app.use(helmet());
app.use(express.json());

app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(specs);
});

app.use(authGuard);

app.use("/api/accounts", accountRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/typelists", typelistRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 8180;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Auth Mode: ${process.env.AUTH_MODE || "JWT"}`);
      console.log(
        `Documentation available at http://localhost:${PORT}/api-docs`,
      );
    });
  } catch (err) {
    console.error(
      "Critical Error: Database connection failed. Server not started.",
    );
    console.error(err);
    process.exit(1);
  }
};

startServer();
