import { mkdir, writeFile } from "node:fs/promises";
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

/** Baca kunci service account dari env GOOGLE_SERVICE_ACCOUNT (JSON mentah atau base64). */
function loadCreds(): { client_email: string; private_key: string } | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT || "";
  if (!raw.trim()) return null;
  try {
    let json = raw.trim();
    if (!json.startsWith("{")) {
      json = Buffer.from(json, "base64").toString("utf8");
    }
    const parsed = JSON.parse(json);
    if (!parsed.client_email || !parsed.private_key) return null;
    return parsed;
  } catch {
    return null;
  }
}

function getDrive(): drive_v3.Drive {
  if (driveClient) return driveClient;
  const creds = loadCreds()!;
  const authClient = new auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });
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
        media: { mimeType: mimeFromName(safe), body: buffer },
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
