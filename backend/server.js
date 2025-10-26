import express from "express";
import dotenv from "dotenv";
import { auth } from "express-oauth2-jwt-bearer";
import authRoutes from "./routes/auth.js";
import opportunitiesRoutes from "./routes/opportunities.js";
import cors from "cors";
import savedRoutes from "./routes/saved.js";
import orgRoutes from "./routes/org.js";

//import adminRoutes from "./routes/admin.js";
//import orgRoutes from "./routes/org.js";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Auth0 JWT middleware
const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});

// cors middleware
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend dev server
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use("/api/saved", savedRoutes);

app.use("/api/org", jwtCheck, orgRoutes);

// ✅ Public routes
app.use("/api/opportunities", opportunitiesRoutes);

// ✅ Protected routes
app.use("/api/auth", jwtCheck, authRoutes);
//app.use("/api/admin", jwtCheck, adminRoutes);
//app.use("/api/org", jwtCheck, orgRoutes);

// ✅ Example protected test route
app.get("/api/protected", jwtCheck, (req, res) => {
  res.json({ message: "Access granted ✅ You are authenticated!" });
});

// ✅ Server start
app.listen(process.env.PORT || 3000, () =>
  console.log(`🚀 Server running on port ${process.env.PORT || 3000}`)
);
