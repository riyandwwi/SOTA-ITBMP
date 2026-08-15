export type IconName =
  | "grid" | "users" | "bank" | "clipboard" | "cap" | "heart" | "wallet"
  | "shield" | "bars" | "gear" | "logout" | "bell" | "search" | "upload"
  | "home" | "list" | "user" | "chevron" | "plus" | "download" | "eye"
  | "trash" | "check" | "x" | "edit" | "alert" | "pdf";

const PATHS: Record<IconName, React.ReactNode> = {
  grid: (<><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>),
  users: (<><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20c0-3.3 2.5-5.6 5.5-5.6s5.5 2.3 5.5 5.6"/><circle cx="17" cy="8.5" r="2.5"/><path d="M15.5 14.7c2.6.3 4.7 2.4 4.7 5.3"/></>),
  bank: (<><path d="M4 10 12 4l8 6"/><rect x="4" y="10" width="16" height="9" rx="0.5"/><line x1="7" y1="10" x2="7" y2="19"/><line x1="12" y1="10" x2="12" y2="19"/><line x1="17" y1="10" x2="17" y2="19"/><line x1="2.5" y1="20.5" x2="21.5" y2="20.5"/></>),
  clipboard: (<><rect x="5" y="4" width="14" height="17" rx="2"/><rect x="9" y="2.3" width="6" height="3" rx="1"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="13.5" x2="16" y2="13.5"/><line x1="8" y1="17" x2="13" y2="17"/></>),
  cap: (<><path d="M2 9 12 4l10 5-10 5-10-5Z"/><path d="M6 11.5v4.7c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6v-4.7"/><path d="M21 9.5v5"/></>),
  heart: (<><path d="M12 20s-7.5-4.7-9.7-9.3C.7 6.9 3 3.5 6.5 3.5c2 0 3.5 1.1 5.5 3.3 2-2.2 3.5-3.3 5.5-3.3 3.5 0 5.8 3.4 4.2 7.2C19.5 15.3 12 20 12 20Z"/></>),
  wallet: (<><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="16.5" cy="14" r="1.3"/></>),
  shield: (<><path d="M12 3l7 3v5c0 5-3.2 8.2-7 10-3.8-1.8-7-5-7-10V6l7-3Z"/><path d="M9 12l2 2 4-4"/></>),
  bars: (<><line x1="5" y1="20" x2="5" y2="11"/><line x1="12" y1="20" x2="12" y2="5"/><line x1="19" y1="20" x2="19" y2="14"/><line x1="2" y1="21" x2="22" y2="21"/></>),
  gear: (<><circle cx="12" cy="12" r="3"/><path d="M12 3v2.4M12 18.6V21M21 12h-2.4M5.4 12H3M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7M18.4 18.4l-1.7-1.7M7.3 7.3 5.6 5.6"/></>),
  logout: (<><path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"/><path d="M16 16l4-4-4-4"/><line x1="20" y1="12" x2="9" y2="12"/></>),
  bell: (<><path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z"/><path d="M9.5 18.5a2.5 2.5 0 0 0 5 0"/></>),
  search: (<><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.3" y1="15.3" x2="20.5" y2="20.5"/></>),
  upload: (<><path d="M12 16V5"/><path d="M7 9l5-5 5 5"/><path d="M4 19h16"/></>),
  home: (<><path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/></>),
  list: (<><line x1="9" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="9" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1.2"/><circle cx="4" cy="12" r="1.2"/><circle cx="4" cy="18" r="1.2"/></>),
  user: (<><circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c0-4.1 3.4-6.5 7.5-6.5s7.5 2.4 7.5 6.5"/></>),
  chevron: (<><path d="M9 5l7 7-7 7"/></>),
  plus: (<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>),
  download: (<><path d="M12 4v11"/><path d="M7 11l5 5 5-5"/><path d="M4 19h16"/></>),
  eye: (<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>),
  trash: (<><path d="M4 7h16"/><path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/><path d="M6 7l1 13.5A1.5 1.5 0 0 0 8.5 22h7a1.5 1.5 0 0 0 1.5-1.5L18 7"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></>),
  check: (<><path d="M5 12l4.5 4.5L19 7"/></>),
  x: (<><path d="M6 6l12 12M18 6L6 18"/></>),
  edit: (<><path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z"/></>),
  alert: (<><path d="M12 3l9 16H3l9-16Z"/><line x1="12" y1="10" x2="12" y2="14"/><circle cx="12" cy="17" r=".3"/></>),
  pdf: (<><path d="M6 3h9l4 4v14H6V3Z"/><path d="M14 3v5h5"/><path d="M9 14h6M9 17h6"/></>),
};

export function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={className ?? "icon"} width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}