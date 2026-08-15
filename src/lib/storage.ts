import { mkdir, writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import path from "node:path";
import { drive, auth, drive_v3 } from "@googleapis/drive";

export interface StoredFile {
  path: string;
  url: string;
}

const BASE_DIR = path.join(process.cwd(), "storage");
const FOLDERS = {
  fotoMahasiswa: "/foto-mahasiswa/",
  khs: "/khs/",
  buktiTransfer: "/bukti-transfer/",
  stt: "/stt/",
} as const;

export type FolderKey = keyof typeof FOLDERS;

/** Folder Google Drive tujuan upload (bisa di-override lewat env). */
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || "1hNKJZQ_PWGci8U9-VvfIMXlPCF6lwLc2";

let driveClient: drive_v3.Drive | null = null;

type DriveCreds =
  | { mode: "oauth2"; clientId: string; clientSecret: string; refreshToken: string }
  | { mode: "serviceAccount"; clientEmail: string; privateKey: string };

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

/**
 * Baca kredensial Drive:
 * 1. OAuth2 user (GOOGLE_REFRESH_TOKEN + CLIENT_ID/SECRET) — punya kuota penyimpanan.
 * 2. Service account (GOOGLE_SERVICE_ACCOUNT, JSON mentah atau base64) — tanpa kuota,
 *    hanya bisa dipakai lewat Shared Drive / Workspace.
 */
function loadCreds(): DriveCreds | null {
  if (process.env.GOOGLE_REFRESH_TOKEN && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    return {
      mode: "oauth2",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    };
  }
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT || "";
  if (!raw.trim()) return null;
  try {
    let json = raw.trim();
    if (!json.startsWith("{")) {
      json = Buffer.from(json, "base64").toString("utf8");
    }
    const parsed = JSON.parse(json);
    if (!parsed.client_email || !parsed.private_key) return null;
    return { mode: "serviceAccount", clientEmail: parsed.client_email, privateKey: parsed.private_key };
  } catch {
    return null;
  }
}

function getDrive(): drive_v3.Drive {
  if (driveClient) return driveClient;
  const creds = loadCreds()!;
  let authClient: InstanceType<typeof auth.OAuth2> | InstanceType<typeof auth.JWT>;
  if (creds.mode === "oauth2") {
    authClient = new auth.OAuth2(creds.clientId, creds.clientSecret);
    authClient.setCredentials({ refresh_token: creds.refreshToken });
  } else {
    authClient = new auth.JWT({
      email: creds.clientEmail,
      key: creds.privateKey,
      scopes: [DRIVE_SCOPE],
    });
  }
  driveClient = drive({ version: "v3", auth: authClient });
  return driveClient;
}

function mimeFromName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  return "application/octet-stream";
}

/**
 * Simpan file. Jika GOOGLE_SERVICE_ACCOUNT di-set -> upload ke Google Drive
 * (folder DRIVE_FOLDER_ID, izin "siapa pun dengan link bisa lihat" per file)
 * dan mengembalikan link Drive. Jika tidak -> simpan ke disk lokal (fallback dev).
 */
export async function saveFile(
  folder: FolderKey,
  filename: string,
  buffer: Buffer
): Promise<StoredFile> {
  const safe = filename.replace(/[^\w.\- ]/g, "_").replace(/\s+/g, "_");

  if (loadCreds()) {
    try {
      const drive = getDrive();
      const res = await drive.files.create({
        requestBody: { name: safe, parents: [DRIVE_FOLDER_ID] },
        media: { mimeType: mimeFromName(safe), body: Readable.from(buffer) },
        fields: "id,name,webViewLink",
      });
      const fileId = res.data.id;
      if (fileId) {
        try {
          await drive.permissions.create({ fileId, requestBody: { role: "reader", type: "anyone" } });
        } catch {
          // izin publik gagal — link tetap tersimpan
        }
        return {
          path: fileId,
          url: res.data.webViewLink || `https://drive.google.com/open?id=${fileId}`,
        };
      }
    } catch {
      // upload ke Drive gagal — lanjut ke disk lokal
    }
  }

  const dir = path.join(BASE_DIR, FOLDERS[folder]);
  await mkdir(dir, { recursive: true });
  const full = path.join(dir, safe);
  await writeFile(full, buffer);
  return {
    path: full,
    url: `/storage${FOLDERS[folder]}${safe}`,
  };
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function isAllowedImage(mime: string) {
  return ["image/png", "image/jpeg"].includes(mime);
}

export function imageExtension(mime: string) {
  return mime === "image/png" ? "png" : "jpg";
}

export function isAllowedPdf(mime: string) {
  return mime === "application/pdf";
}
