// Mahnwesen-Logik: Soll/Ist-Vergleich pro Mieter
import { eur, date as fmtDate } from "@/lib/format";

export type DunningLevel = 0 | 1 | 2 | 3;

export interface TenantBalance {
  tenant: any;
  unit: any;
  property: any;
  monthsDue: number;
  rentCold: number;
  expectedTotal: number;
  paidTotal: number;
  balance: number; // negative = Außenstand
  level: DunningLevel;
  lastPayment: string | null;
}

const monthsBetween = (from: Date, to: Date) => {
  if (to < from) return 0;
  return (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()) + 1;
};

export const computeBalances = (
  tenants: any[],
  units: any[],
  properties: any[],
  payments: any[],
  asOf: Date = new Date(),
): TenantBalance[] => {
  return tenants.map((t) => {
    const unit = units.find((u) => u.id === t.unit_id);
    const property = unit ? properties.find((p) => p.id === unit.property_id) : null;
    const rentCold = Number(unit?.rent_cold ?? 0);
    const start = t.lease_start ? new Date(t.lease_start) : null;
    const end = t.lease_end ? new Date(t.lease_end) : asOf;
    const horizon = end < asOf ? end : asOf;
    const monthsDue = start ? monthsBetween(start, horizon) : 0;
    const expectedTotal = rentCold * monthsDue;

    const tenantPayments = payments.filter(
      (p) => p.tenant_id === t.id && p.kind === "rent_cold",
    );
    const paidTotal = tenantPayments.reduce((s, p) => s + Number(p.amount), 0);
    const lastPayment = tenantPayments
      .map((p) => p.paid_on)
      .sort()
      .pop() ?? null;

    const balance = paidTotal - expectedTotal;
    const monthsBehind = rentCold > 0 ? Math.floor(-balance / rentCold) : 0;

    let level: DunningLevel = 0;
    if (monthsBehind >= 1) level = 1;
    if (monthsBehind >= 2) level = 2;
    if (monthsBehind >= 3) level = 3;

    return {
      tenant: t, unit, property,
      monthsDue, rentCold, expectedTotal, paidTotal, balance, level, lastPayment,
    };
  });
};

const LEVEL_TEXT: Record<Exclude<DunningLevel, 0>, { title: string; intro: string; deadline: number; closing: string }> = {
  1: {
    title: "Zahlungserinnerung",
    intro: "leider konnten wir bisher keinen Eingang Ihrer fälligen Mietzahlung verzeichnen. Möglicherweise ist Ihnen dies entgangen — wir bitten Sie höflich um Ausgleich.",
    deadline: 14,
    closing: "Sollten Sie die Zahlung bereits veranlasst haben, betrachten Sie dieses Schreiben als gegenstandslos.",
  },
  2: {
    title: "1. Mahnung",
    intro: "trotz unserer Zahlungserinnerung konnten wir bisher keinen Zahlungseingang feststellen. Wir mahnen Sie hiermit förmlich zur Zahlung.",
    deadline: 10,
    closing: "Bei weiterem Verzug behalten wir uns rechtliche Schritte sowie die Geltendmachung von Verzugszinsen gemäß § 288 BGB vor.",
  },
  3: {
    title: "2. Mahnung — Letzte Aufforderung",
    intro: "Sie befinden sich mit der Zahlung Ihrer Miete in erheblichem Rückstand. Dies ist die letzte außergerichtliche Aufforderung.",
    deadline: 7,
    closing: "Sollte der Betrag nicht fristgerecht eingehen, werden wir die fristlose Kündigung des Mietverhältnisses gemäß § 543 Abs. 2 Nr. 3 BGB sowie ein gerichtliches Mahnverfahren einleiten.",
  },
};

export const generateDunningHTML = (b: TenantBalance, landlordName: string, landlordEmail: string): string => {
  if (b.level === 0) return "";
  const cfg = LEVEL_TEXT[b.level];
  const today = new Date();
  const deadline = new Date(today.getTime() + cfg.deadline * 86400000);
  const outstanding = Math.abs(b.balance);
  const addr = [b.property?.street, [b.property?.zip, b.property?.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");

  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${cfg.title} — ${b.tenant.full_name}</title>
<style>
  @page { size: A4; margin: 25mm 20mm; }
  body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; color: #111; font-size: 11pt; line-height: 1.55; }
  .sender { font-size: 8.5pt; color: #555; border-bottom: 1px solid #ccc; padding-bottom: 2mm; margin-bottom: 18mm; }
  .recipient { margin-bottom: 18mm; }
  .meta { text-align: right; margin-bottom: 8mm; font-size: 9.5pt; color: #555; }
  h1 { font-size: 14pt; margin: 0 0 6mm 0; }
  table.amount { width: 100%; border-collapse: collapse; margin: 6mm 0; }
  table.amount td { padding: 2mm 3mm; border-bottom: 1px solid #eee; font-size: 10.5pt; }
  table.amount tr.total td { border-top: 2px solid #111; border-bottom: none; font-weight: 700; font-size: 12pt; padding-top: 3mm; }
  .footer { margin-top: 14mm; font-size: 9pt; color: #666; border-top: 1px solid #ccc; padding-top: 3mm; }
  @media print { .no-print { display: none; } }
  .no-print { position: fixed; top: 10px; right: 10px; }
  .no-print button { padding: 8px 16px; background: #d4af6a; color: #000; border: 0; border-radius: 6px; font-weight: 600; cursor: pointer; }
</style></head><body>
<div class="no-print"><button onclick="window.print()">Drucken / als PDF speichern</button></div>
<div class="sender">${landlordName} · ${landlordEmail}</div>
<div class="recipient">
  <strong>${b.tenant.full_name}</strong><br>
  ${b.tenant.email ? b.tenant.email + "<br>" : ""}
  ${addr ? "Mietobjekt: " + addr + "<br>" : ""}
  ${b.unit?.label ? "Einheit: " + b.unit.label : ""}
</div>
<div class="meta">${fmtDate(today)}</div>
<h1>${cfg.title}</h1>
<p>Sehr geehrte/r ${b.tenant.full_name},</p>
<p>${cfg.intro}</p>
<table class="amount">
  <tr><td>Soll-Miete (kalt) seit Mietbeginn</td><td style="text-align:right">${eur(b.expectedTotal)}</td></tr>
  <tr><td>Erfasste Zahlungen</td><td style="text-align:right">${eur(b.paidTotal)}</td></tr>
  <tr class="total"><td>Offener Betrag</td><td style="text-align:right">${eur(outstanding)}</td></tr>
</table>
<p>Wir bitten Sie, den offenen Betrag bis spätestens <strong>${fmtDate(deadline)}</strong> auf das Ihnen bekannte Konto zu überweisen.</p>
<p>${cfg.closing}</p>
<p>Mit freundlichen Grüßen<br><br>${landlordName}</p>
<div class="footer">Erstellt mit ImmonIQ · Diese Mahnung wurde maschinell erstellt und ist auch ohne Unterschrift gültig.</div>
</body></html>`;
};

export const openDunningWindow = (html: string) => {
  const w = window.open("", "_blank", "width=900,height=1100");
  if (!w) return false;
  w.document.write(html);
  w.document.close();
  return true;
};
