import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import admin from "firebase-admin"
import attendanceRoutes from "./routes/attendance.js"
import employeeRoutes from "./routes/employees.js"
import uploadRoutes from "./routes/uploads.js"

dotenv.config()

// --- Firebase Admin SDK Initialization ---
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
  console.log("Firebase Admin SDK initialized successfully.")
} catch (error) {
  console.error("Failed to initialize Firebase Admin SDK:", error)
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    console.error("FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set or is empty.")
  }
}

const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/attendance", attendanceRoutes)
app.use("/api/employees", employeeRoutes)
app.use("/api/uploads", uploadRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" })
})

// Root route handler
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Attendance API. See /api/health for status." })
})

// Global error handler - MUST be the last middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  const statusCode = err.status || 500
  const message = err.message || "Internal Server Error"
  res.status(statusCode).json({ error: { message, status: statusCode } })
})

// Start the server only when running locally (not in a serverless environment)
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

// Export the app for Vercel
export default app
