import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import attendanceRoutes from "./routes/attendance.js"
import employeeRoutes from "./routes/employees.js"
import uploadRoutes from "./routes/uploads.js"

dotenv.config()

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
