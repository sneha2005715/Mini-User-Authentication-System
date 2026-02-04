import express from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { supabase } from "./supabaseClient.js";

dotenv.config();

const app = express();
app.use(express.json());

/* ============================
   ✅ POST /signup
============================ */
app.post("/signup", async (req, res) => {
  try {
    const { name, email, age, location, password } = req.body;

    // 1️⃣ Validate input
    if (!name || !email || !age || !location || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2️⃣ Check duplicate email
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Insert user
    const { error } = await supabase.from("users").insert([
      {
        name,
        email,
        age,
        location,
        password: hashedPassword,
      },
    ]);

    if (error) throw error;

    return res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ============================
   👤 GET /myprofile?name=Ravi
============================ */
app.get("/myprofile", async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ message: "Name query parameter required" });
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, age, location")
      .eq("name", name)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: "Server error" });
  }
});

/* ============================
   Server Start
============================ */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
