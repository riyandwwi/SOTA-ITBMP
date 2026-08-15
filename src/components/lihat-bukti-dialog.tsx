"use client";

import { useState } from "react";
import { Icon } from "./icons";

function extractDriveId(url: string): string | null {
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  return m ? m[1] : null;
}

export default function LihatBuktiDialog({ url }: { url: string }) {
  const [open, setOpen] = useState(false);
  const driveId = extractDriveId(url);
  const imgSrc = driveId
    ? `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`
    : url.startsWith("http")
      ? url
      : null;

  return (
    <>
      <button className="btn btn-ghost btn-sm" type="button" onClick={() => setOpen(true)}>
        <Icon name="eye" size={14} />Lihat Bukti
      </button>

      {open ? (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--surface)", color: "var(--ink)", borderRadius: 12, maxWidth: 640, width: "100%", padding: 18, boxShadow: "0 20px 60px rgba(0,0,0,0.35)", maxHeight: "90vh", overflow: "auto", border: "1px solid var(--border)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <strong>Bukti Pembayaran</strong>
              <button className="btn-icon" type="button" onClick={() => setOpen(false)} title="Tutup">
                <Icon name="x" size={15} />
              </button>
            </div>

            {imgSrc ? (
              <img
                src={imgSrc}
                alt="Bukti pembayaran"
                style={{ width: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: 8, background: "#fff" }}
              />
            ) : (
              <p className="meta" style={{ textAlign: "center", padding: "30px 0" }}>Bukti tidak tersedia.</p>
            )}

            <div className="list-actions" style={{ marginTop: 14 }}>
              {url.startsWith("http") ? (
                <a className="btn btn-primary btn-sm" href={url} target="_blank" rel="noopener noreferrer">
                  <Icon name="upload" size={14} />Buka di Drive
                </a>
              ) : null}
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setOpen(false)}>Tutup</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
