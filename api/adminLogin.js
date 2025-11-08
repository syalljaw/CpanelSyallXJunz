export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { key } = req.body;
  const ADMIN_KEY = process.env.ADMIN_KEY;

  if (!key) {
    return res.status(400).json({ success: false, message: "ADMIN_KEY harus diisi." });
  }

  if (key === ADMIN_KEY) {
    return res.status(200).json({ success: true, message: "Login berhasil!" });
  } else {
    return res.status(401).json({ success: false, message: "ADMIN_KEY salah." });
  }
}
