import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { db } from "./firebase-config.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" })
})

// Add Employee
app.post("/api/employees", async (req, res) => {
  try {
    const { firstName, lastName, email, employeeId, department, position, phone } = req.body

    // Validation
    if (!firstName || !lastName || !email || !employeeId) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Check if employee ID already exists
    const existingEmployee = await db.collection("employees").doc(employeeId).get()
    if (existingEmployee.exists) {
      return res.status(400).json({ error: "Employee ID already exists" })
    }

    // Add employee to Firestore
    const employeeData = {
      firstName,
      lastName,
      email,
      employeeId,
      department: department || "",
      position: position || "",
      phone: phone || "",
      createdAt: new Date().toISOString(),
      faceEnrolled: false,
    }

    await db.collection("employees").doc(employeeId).set(employeeData)

    res.status(201).json({
      message: "Employee added successfully",
      data: employeeData,
    })
  } catch (error) {
    console.error("Error adding employee:", error)
    res.status(500).json({ error: "Failed to add employee" })
  }
})

// Get all employees
app.get("/api/employees", async (req, res) => {
  try {
    const snapshot = await db.collection("employees").get()
    const employees = []
    snapshot.forEach((doc) => {
      employees.push({ id: doc.id, ...doc.data() })
    })
    res.json(employees)
  } catch (error) {
    console.error("Error fetching employees:", error)
    res.status(500).json({ error: "Failed to fetch employees" })
  }
})

// Get employee by ID
app.get("/api/employees/:id", async (req, res) => {
  try {
    const doc = await db.collection("employees").doc(req.params.id).get()
    if (!doc.exists) {
      return res.status(404).json({ error: "Employee not found" })
    }
    res.json({ id: doc.id, ...doc.data() })
  } catch (error) {
    console.error("Error fetching employee:", error)
    res.status(500).json({ error: "Failed to fetch employee" })
  }
})

// Update employee
app.put("/api/employees/:id", async (req, res) => {
  try {
    const { firstName, lastName, email, department, position, phone } = req.body

    // Check if at least one field is provided
    if (!firstName && !lastName && !email && !department && !position && !phone) {
      return res.status(400).json({ error: "At least one field is required to update" })
    }

    // Check if employee exists
    const doc = await db.collection("employees").doc(req.params.id).get()
    if (!doc.exists) {
      return res.status(404).json({ error: "Employee not found" })
    }

    const updateData = {}
    if (firstName) updateData.firstName = firstName
    if (lastName) updateData.lastName = lastName
    if (email) updateData.email = email
    if (department) updateData.department = department
    if (position) updateData.position = position
    if (phone) updateData.phone = phone
    updateData.updatedAt = new Date().toISOString()

    await db.collection("employees").doc(req.params.id).update(updateData)

    res.json({
      message: "Employee updated successfully",
      data: updateData,
    })
  } catch (error) {
    console.error("Error updating employee:", error)
    res.status(500).json({ error: "Failed to update employee" })
  }
})

// Delete employee
app.delete("/api/employees/:id", async (req, res) => {
  try {
    const doc = await db.collection("employees").doc(req.params.id).get()
    if (!doc.exists) {
      return res.status(404).json({ error: "Employee not found" })
    }

    await db.collection("employees").doc(req.params.id).delete()
    res.json({ message: "Employee deleted successfully" })
  } catch (error) {
    console.error("Error deleting employee:", error)
    res.status(500).json({ error: "Failed to delete employee" })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
