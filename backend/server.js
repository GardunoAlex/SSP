import express from "express";
import dotenv from "dotenv";
import { auth } from "express-oauth2-jwt-bearer";
import authRoutes from "./routes/auth.js";


dotenv.config();

const app = express();
app.use(express.json());

// ✅ Middleware to verify Auth0 JWTs
const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});

// Apply it globally or selectively
app.use("/api", jwtCheck);

// Example protected route
app.get("/api/protected", (req, res) => {
  res.json({ message: "Access granted ✅ You are authenticated!" });
});

app.listen(process.env.PORT || 3000, () =>
  console.log(`🚀 Server running on port ${process.env.PORT || 3000}`)
);

app.use("/api/auth", jwtCheck, authRoutes);
