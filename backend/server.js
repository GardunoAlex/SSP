import express from "express";
import dotenv from "dotenv";
import { auth } from "express-oauth2-jwt-bearer";
import authRoutes from "./routes/auth.js";
import opportunitiesRoutes from "./routes/opportunities.js";
import cors from "cors";
import savedRoutes from "./routes/saved.js";
import orgRoutes from "./routes/org.js";

import adminRoutes from "./routes/admin.js";
import studentRoutes from "./routes/students.js";
import savedOrganizationsRoutes from "./routes/savedOrgs.js";
import organizationRoutes from "./routes/organizations.js";
import ReviewRoutes from "./routes/reviews.js"


dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Auth0 JWT middleware
const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256",
});

// cors middleware
//https://ssp-phi-ivory.vercel.app
//http://localhost:5173
app.use(
  cors({
    origin: [
      "http://localhost:5173",          // for local dev
      "https://ssp-phi-ivory.vercel.app" // ✅ your deployed frontend
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("/api/saved", savedRoutes);
app.use("/api/savedOrgs", savedOrganizationsRoutes);

app.use("/api/org", jwtCheck, orgRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/student", jwtCheck, studentRoutes);

// ✅ Public routes
app.use("/api/opportunities", opportunitiesRoutes);
app.use("/api/reviews", ReviewRoutes);

// ✅ Protected routes
app.use("/api/auth", jwtCheck, authRoutes);
app.use("/api/admin", jwtCheck, adminRoutes);


// ✅ Example protected test route
app.get("/api/protected", jwtCheck, (req, res) => {
  res.json({ message: "Access granted ✅ You are authenticated!" });
});

// ✅ Server start
app.listen(process.env.PORT || 3000, () =>
  console.log(`🚀 Server running on port ${process.env.PORT || 3000}`)
);
