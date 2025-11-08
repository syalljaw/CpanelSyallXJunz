// pages/api/deleteUser.js
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).json({ error: "Method tidak diizinkan" });

  const ADMIN_KEY = process.env.ADMIN_KEY;
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token || token !== ADMIN_KEY) {
    return res.status(403).json({ error: "❌ Akses ditolak!" });
  }

  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username wajib dikirim" });

  try {
    const filePath = path.join(process.cwd(), "users.json");
    const data = fs.readFileSync(filePath, "utf8");
    let users = JSON.parse(data);

    const index = users.findIndex(u => u.username === username);
    if (index === -1) return res.status(404).json({ error: "User tidak ditemukan" });

    users.splice(index, 1);
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));

    return res.status(200).json({ message: "✅ User berhasil dihapus" });
  } catch (err) {
    return res.status(500).json({ error: "Gagal menghapus user: " + err.message });
  }
}
