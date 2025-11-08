import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username dan password wajib diisi." });
  }

  try {
    // 📄 Ambil lokasi file users.json di root project
    const filePath = path.join(process.cwd(), "users.json");

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "File users.json tidak ditemukan." });
    }

    // 📖 Baca file JSON
    const jsonData = fs.readFileSync(filePath, "utf8");
    const users = JSON.parse(jsonData);

    // 🔍 Cari user sesuai username
    const user = users.find((u) => u.username === username);

    if (!user) {
      return res.status(401).json({ success: false, message: "Username tidak terdaftar." });
    }

    // 🔑 Cek password menggunakan bcrypt
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ success: false, message: "Password salah." });
    }

    // ✅ Jika cocok, login sukses
    return res.status(200).json({
      success: true,
      message: "Login berhasil!",
      username: user.username,
      created_at: user.created_at,
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server: " + err.message,
    });
  }
      }
