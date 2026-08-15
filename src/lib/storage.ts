import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

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

/** Simpan file ke disk lokal (adapter: disk → S3-compatible di production). */
export async function saveFile(
  folder: FolderKey,
  filename: string,
  buffer: Buffer
): Promise<StoredFile> {
  const dir = path.join(BASE_DIR, FOLDERS[folder]);
  await mkdir(dir, { recursive: true });
  const safe = filename.replace(/[^\w.\-]/g, "_");
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