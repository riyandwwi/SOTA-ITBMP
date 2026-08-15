"use client";

import { useActionState } from "react";
import { generateBillingAction } from "@/lib/actions";
import { Icon } from "./icons";

export default function GenerateBillingForm() {
  const [state, formAction, pending] = useActionState(generateBillingAction, {});
  return (
    <form action={formAction} className="list-actions">
      <input className="input" name="periode" placeholder="Periode, mis: Genap 2025/2026" style={{ margin: 0, flex: 1 }} />
      {state?.ok ? <span className="badge badge-primary">Tagihan dibuat</span> : null}
      {state?.error ? <span className="badge badge-accent">{state.error}</span> : null}
      <button className="btn btn-primary btn-sm" disabled={pending}><Icon name="plus" size={14} />Generate Tagihan</button>
    </form>
  );
}