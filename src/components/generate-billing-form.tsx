"use client";

import { useActionState } from "react";
import { generateBillingAction } from "@/lib/actions";
import { Icon } from "./icons";
import { bulanKeyNow, bulanLabel } from "@/lib/format";

export default function GenerateBillingForm() {
  const [state, formAction, pending] = useActionState(generateBillingAction, {});
  return (
    <form action={formAction} className="list-actions">
      <span className="helper-note" style={{ margin: 0, flex: 1 }}>Generate tagihan untuk <b>{bulanLabel(bulanKeyNow())}</b> (semua mapping aktif).</span>
      {state?.ok ? <span className="badge badge-primary">Tagihan dibuat</span> : null}
      {state?.error ? <span className="badge badge-accent">{state.error}</span> : null}
      <button className="btn btn-primary btn-sm" disabled={pending}><Icon name="plus" size={14} />Generate</button>
    </form>
  );
}