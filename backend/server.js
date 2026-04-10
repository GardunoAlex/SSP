import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import savedRoutes from "./routes/saved.js";
import { attachUser } from "./middleware/attachUser.js";
import { requireAdmin } from "./middleware/roles.js";
import { requireOrg } from "./middleware/roles.js";
import { requireStudent } from "./middleware/roles.js";
import authRoutes from "./routes/auth.js";
import opportunitiesRoutes from "./routes/opportunities.js";
import orgRoutes from "./routes/org.js";
import adminRoutes from "./routes/admin.js";
import studentRoutes from "./routes/students.js";
import savedOrganizationsRoutes from "./routes/savedOrgs.js";
import organizationRoutes from "./routes/organizations.js";
import ReviewRoutes from "./routes/reviews.js";
import uploadRoutes from "./routes/upload.js";
import { jwtCheck } from "./middleware/jwtCheck.js";


dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cors middleware
//https://ssp-phi-ivory.vercel.app
//http://localhost:5173
app.use(
  cors({
    origin: [
      "http://localhost:5173",          // for local dev
      "https://ssp-phi-ivory.vercel.app",
      "https://studentstarterplus.com" // ✅ your deployed frontend
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("/api/saved", savedRoutes);
app.use("/api/savedOrgs", savedOrganizationsRoutes);

app.use("/api/organizations", organizationRoutes);

// Public routes
app.use("/api/opportunities", opportunitiesRoutes);
app.use("/api/reviews", ReviewRoutes);

// Protected routes
app.use("/api/upload", jwtCheck, uploadRoutes);
app.use("/api/auth", jwtCheck, authRoutes);
app.use("/api/admin", jwtCheck, attachUser, requireAdmin, adminRoutes);
app.use("/api/org", jwtCheck, orgRoutes);
app.use("/api/student", jwtCheck, studentRoutes);


// Example protected test route
app.get("/api/protected", jwtCheck, (req, res) => {
  res.json({ message: "Access granted ✅ You are authenticated!" });
});

// Server start
app.listen(process.env.PORT || 3000, () =>
  console.log(`🚀 Server running on port ${process.env.PORT || 3000}`)
);
