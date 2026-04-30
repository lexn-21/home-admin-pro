import { Scale, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";

/** Centralized German real-estate law references. */
export const LEGAL: Record<string, { ref: string; url: string; title: string; summary: string }> = {
  bgb_535: {
    ref: "§ 535 BGB",
    url: "https://www.gesetze-im-internet.de/bgb/__535.html",
    title: "Inhalt des Mietvertrags",
    summary: "Vermieter muss Wohnung in vertragsgemäßem Zustand übergeben & erhalten. Mieter zahlt Miete.",
  },
  bgb_556: {
    ref: "§ 556 BGB",
    url: "https://www.gesetze-im-internet.de/bgb/__556.html",
    title: "Betriebskostenabrechnung",
    summary: "NK-Abrechnung muss spätestens 12 Monate nach Ende des Abrechnungszeitraums beim Mieter sein.",
  },
  bgb_558: {
    ref: "§ 558 BGB",
    url: "https://www.gesetze-im-internet.de/bgb/__558.html",
    title: "Mieterhöhung bis ortsüblicher Vergleichsmiete",
    summary: "Max. 20 % in 3 Jahren (Kappungsgrenze 15 % in vielen Städten). Begründung mit Mietspiegel nötig.",
  },
  bgb_573: {
    ref: "§ 573 BGB",
    url: "https://www.gesetze-im-internet.de/bgb/__573.html",
    title: "Ordentliche Kündigung Vermieter",
    summary: "Nur mit berechtigtem Interesse (Eigenbedarf, Vertragsverletzung, wirtschaftl. Verwertung).",
  },
  betrkv: {
    ref: "BetrKV",
    url: "https://www.gesetze-im-internet.de/betrkv/",
    title: "Betriebskostenverordnung",
    summary: "Definiert die 17 umlagefähigen Betriebskosten (Grundsteuer, Wasser, Müll, Heizung, …).",
  },
  geg_80: {
    ref: "§ 80 GEG",
    url: "https://www.gesetze-im-internet.de/geg/__80.html",
    title: "Energieausweis",
    summary: "Bei Verkauf/Vermietung Pflicht. Gültig 10 Jahre. Kennwerte müssen im Inserat stehen.",
  },
  estg_21: {
    ref: "§ 21 EStG",
    url: "https://www.gesetze-im-internet.de/estg/__21.html",
    title: "Einkünfte aus Vermietung & Verpachtung",
    summary: "Anlage V. Werbungskosten, AfA, Erhaltungsaufwand absetzbar.",
  },
  estg_7b: {
    ref: "§ 7b EStG",
    url: "https://www.gesetze-im-internet.de/estg/__7b.html",
    title: "Sonder-AfA Mietwohnungsbau",
    summary: "5 % p.a. zusätzlich für 4 Jahre für neue Mietwohnungen (Bauantrag 2023–2026).",
  },
  agg_19: {
    ref: "§ 19 AGG",
    url: "https://www.gesetze-im-internet.de/agg/__19.html",
    title: "Diskriminierungsverbot bei Mietverhältnissen",
    summary: "Keine Ablehnung wegen Herkunft, Geschlecht, Religion, Behinderung, Alter, sex. Identität.",
  },
  ao_147: {
    ref: "§ 147 AO",
    url: "https://www.gesetze-im-internet.de/ao_1977/__147.html",
    title: "Aufbewahrungsfristen",
    summary: "Buchungsbelege & Rechnungen: 10 Jahre. Geschäftsbriefe: 6 Jahre.",
  },
  heizkv: {
    ref: "HeizkostenV",
    url: "https://www.gesetze-im-internet.de/heizkostenv/",
    title: "Heizkostenverordnung",
    summary: "Mind. 50 %, max. 70 % der Heizkosten verbrauchsabhängig abrechnen.",
  },
  bgb_551: {
    ref: "§ 551 BGB",
    url: "https://www.gesetze-im-internet.de/bgb/__551.html",
    title: "Mietkaution",
    summary: "Max. 3 Netto-Kaltmieten. Insolvenzfest auf separatem Konto anzulegen, verzinst.",
  },
};

export type LegalKey = keyof typeof LEGAL;

interface Props {
  keys: LegalKey[];
  title?: string;
  compact?: boolean;
}

export default function LegalSnippet({ keys, title = "Rechtliches im Überblick", compact = false }: Props) {
  const items = keys.map(k => LEGAL[k]).filter(Boolean);
  if (!items.length) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((it, i) => (
          <a
            key={i}
            href={it.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition"
          >
            <Scale className="h-3 w-3" /> {it.ref}
          </a>
        ))}
      </div>
    );
  }

  return (
    <Card className="p-4 glass border-primary/20">
      <div className="flex items-center gap-2 mb-3">
        <Scale className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <ul className="space-y-2.5">
        {items.map((it, i) => (
          <li key={i} className="text-xs">
            <a
              href={it.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              {it.ref} · {it.title} <ExternalLink className="h-3 w-3" />
            </a>
            <p className="text-muted-foreground mt-0.5 leading-relaxed">{it.summary}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
