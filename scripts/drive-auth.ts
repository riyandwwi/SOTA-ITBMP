import "dotenv/config";
import http from "node:http";
import { writeFile, readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const PORT = 5178;
const REDIRECT = `http://localhost:${PORT}/callback`;
const SCOPES = "https://www.googleapis.com/auth/drive.file";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET belum di-set di .env");
  process.exit(1);
}

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
  }).toString();

async function exchange(code: string) {
  const params = new URLSearchParams({
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT,
    grant_type: "authorization_code",
  });
  const res = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: params });
  const data = (await res.json()) as { refresh_token?: string; access_token?: string; error?: string };
  if (!res.ok || !data.refresh_token) {
    console.error("Gagal tukar code -> token:", JSON.stringify(data));
    process.exit(1);
  }
  return data.refresh_token;
}

async function saveToEnv(refreshToken: string) {
  const envPath = path.join(process.cwd(), ".env");
  const content = await readFile(envPath, "utf8");
  const line = `GOOGLE_REFRESH_TOKEN="${refreshToken}"`;
  const updated = content.match(/^GOOGLE_REFRESH_TOKEN=.*$/m)
    ? content.replace(/^GOOGLE_REFRESH_TOKEN=.*$/m, line)
    : content.replace(/\s*$/, "\n" + line + "\n");
  await writeFile(envPath, updated, "utf8");
  return envPath;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  if (url.pathname !== "/callback") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  if (error) {
    res.writeHead(400);
    res.end(`Auth dibatalkan: ${error}`);
    server.close();
    return;
  }
  if (!code) {
    res.writeHead(400);
    res.end("Tidak ada code");
    server.close();
    return;
  }
  try {
    const refreshToken = await exchange(code);
    const envPath = await saveToEnv(refreshToken);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h2>Autentikasi berhasil!</h2><p>GOOGLE_REFRESH_TOKEN sudah disimpan ke .env. Silakan tutup tab ini.</p>");
    server.close();
    console.log("\nOK. Refresh token tersimpan di:", envPath);
  } catch (e) {
    res.writeHead(500);
    res.end("Gagal menyimpan token");
    server.close();
    console.error(e);
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log("Menunggu otorisasi di http://localhost:" + PORT + "/callback");
  console.log("Pastikan redirect URI ini terdaftar di Google Cloud Console OAuth client.");
  console.log("\nMembuka browser...");
  spawn("cmd", ["/c", "start", "", authUrl], { detached: true, stdio: "ignore" });
  console.log("Jika browser tidak terbuka otomatis, buka URL ini:\n" + authUrl + "\n");
});
