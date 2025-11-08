import bcrypt from 'bcryptjs'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_REPO = process.env.GITHUB_REPO  // contoh: "username/reponame"
const GITHUB_PATH = process.env.GITHUB_PATH || 'users.json'

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Hanya menerima POST' })

  const { username, password } = req.body || {}
  if (!username || !password)
    return res.status(400).json({ error: 'Username dan password wajib diisi' })

  try {
    // Ambil data users.json dari GitHub
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${encodeURIComponent(GITHUB_PATH)}`
    const headers = {
      Authorization: `token ${GITHUB_TOKEN}`,
      'User-Agent': 'vercel-html-demo',
    }

    const getRes = await fetch(url, { headers })
    let users = []
    let sha = null

    if (getRes.status === 200) {
      const file = await getRes.json()
      sha = file.sha
      users = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'))
    }

    // Cek username sudah ada?
    if (users.some(u => u.username === username))
      return res.status(409).json({ error: 'Username sudah terdaftar' })

    // Tambah user baru
    const hashed = await bcrypt.hash(password, 10)
    users.push({ username, password: hashed, created_at: new Date().toISOString() })

    // Simpan ke GitHub
    const newContent = Buffer.from(JSON.stringify(users, null, 2)).toString('base64')
    const putRes = await fetch(url, {
      method: 'PUT',
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: `Tambah user ${username}`,
        content: newContent,
        sha
      })
    })

    if (!putRes.ok) {
      const errorText = await putRes.text()
      throw new Error(`GitHub PUT error: ${errorText}`)
    }

    return res.status(200).json({ message: 'Akun berhasil disimpan ke GitHub!' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}