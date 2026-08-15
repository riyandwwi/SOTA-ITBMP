import { Icon, type IconName } from "./icons";
import { initial } from "@/lib/format";

export function Avatar({ nama, tone, size = 32 }: { nama: string; tone?: string; size?: number }) {
  return (
    <div className="avatar" style={{ width: size, height: size, background: tone, fontSize: size * 0.38 }}>
      {initial(nama)}
    </div>
  );
}

const TONES: Record<string, string> = {
  primary: "var(--primary-dark)",
  accent: "var(--accent)",
  info: "var(--info)",
  muted: "var(--muted)",
  danger: "var(--danger)",
};

export function Badge({ text, tone }: { text: string; tone?: string }) {
  return <span className={`badge badge-${tone || "muted"}`}>{text}</span>;
}

export function StatCard({ label, value, delta, tone, deltaTone }: {
  label: string; value: string; delta?: string; tone?: "accent" | "danger" | "info" | "default"; deltaTone?: string;
}) {
  const cls = tone && tone !== "default" ? ` value ${tone}` : " value";
  return (
    <div className="stat-card">
      <div className="label">{label}</div>
      <div className={cls}>{value}</div>
      {delta ? <div className="delta" style={deltaTone ? { color: deltaTone } : undefined}>{delta}</div> : null}
    </div>
  );
}

export function Card({ title, hint, actions, children, noPad }: {
  title?: string; hint?: string; actions?: React.ReactNode; children: React.ReactNode; noPad?: boolean;
}) {
  return (
    <div className="card">
      {title || actions ? (
        <div className="card-head">
          <div>{title ? <h3>{title}</h3> : null}{hint ? <p className="hint">{hint}</p> : null}</div>
          {actions}
        </div>
      ) : null}
      <div className={noPad ? undefined : "card-body"} style={noPad ? { padding: 0 } : undefined}>
        {children}
      </div>
    </div>
  );
}

export function PageHeader({ title, sub, actions, badge }: {
  title: string; sub?: string; actions?: React.ReactNode; badge?: { text: string; tone?: string };
}) {
  return (
    <div className="main-header">
      <div>
        <h1>{title}</h1>
        {sub ? <p className="sub">{sub}</p> : null}
      </div>
      <div className="header-actions">
        {badge ? <span className="readonly-badge"><Icon name="eye" size={13} />{badge.text}</span> : null}
        {actions}
      </div>
    </div>
  );
}

export function Empty({ message = "Belum ada data." }: { message?: string }) {
  return <div className="empty">{message}</div>;
}

export function ActionBtn({ icon, label, href }: { icon: IconName; label: string; href: string }) {
  return (
    <a className="btn btn-primary btn-sm" href={href}><Icon name={icon} size={14} />{label}</a>
  );
}