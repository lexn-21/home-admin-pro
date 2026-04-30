import { useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Stagger, Item } from "@/components/motion/Primitives";
import { CalendarClock, AlertTriangle, CheckCircle2, ExternalLink, Clock } from "lucide-react";
import { date } from "@/lib/format";

type Deadline = {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  category: "steuer" | "miete" | "betrieb" | "recht";
  law?: { label: string; url: string };
};

const buildDeadlines = (): Deadline[] => {
  const now = new Date();
  const year = now.getFullYear();
  return [
    {
      id: "1",
      title: "Nebenkostenabrechnung erstellen",
      description: "Abrechnung für das Vorjahr muss innerhalb von 12 Monaten nach Ende des Abrechnungszeitraums beim Mieter sein.",
      dueDate: new Date(year, 11, 31),
      category: "miete",
      law: { label: "§ 556 Abs. 3 BGB", url: "https://www.gesetze-im-internet.de/bgb/__556.html" },
    },
    {
      id: "2",
      title: "Einkommensteuererklärung (Anlage V)",
      description: "Abgabefrist Steuererklärung für das Vorjahr, mit Steuerberater verlängert sich die Frist.",
      dueDate: new Date(year, 6, 31),
      category: "steuer",
      law: { label: "§ 149 AO", url: "https://www.gesetze-im-internet.de/ao_1977/__149.html" },
    },
    {
      id: "3",
      title: "Aufbewahrung Belege (§ 147 AO)",
      description: "Buchungsbelege, Kaufverträge, Rechnungen: 10 Jahre aufbewahren. Der Tresor überwacht automatisch.",
      dueDate: new Date(year + 10, 11, 31),
      category: "steuer",
      law: { label: "§ 147 AO", url: "https://www.gesetze-im-internet.de/ao_1977/__147.html" },
    },
    {
      id: "4",
      title: "Rauchwarnmelder-Wartung",
      description: "Jährliche Funktionsprüfung gemäß Landesbauordnung NRW (§ 47 BauO NRW).",
      dueDate: new Date(year, now.getMonth() + 2, 15),
      category: "betrieb",
      law: { label: "§ 47 BauO NRW", url: "https://recht.nrw.de/lmi/owa/br_text_anzeigen?v_id=74820180625161151068" },
    },
    {
      id: "5",
      title: "Grundsteuererklärung / Feststellung",
      description: "Neue Grundsteuer ab 2025. Änderungen rechtzeitig melden beim Finanzamt.",
      dueDate: new Date(year, 0, 31),
      category: "steuer",
      law: { label: "GrStG", url: "https://www.gesetze-im-internet.de/grstg_1973/" },
    },
    {
      id: "6",
      title: "Mieterhöhung Kappungsgrenze prüfen",
      description: "Max. 20% innerhalb 3 Jahren (15% in angespanntem Wohnungsmarkt wie NRW-Großstädten).",
      dueDate: new Date(year, now.getMonth() + 6, 1),
      category: "recht",
      law: { label: "§ 558 BGB", url: "https://www.gesetze-im-internet.de/bgb/__558.html" },
    },
  ];
};

const tone = (days: number) => {
  if (days < 0) return { label: "Überfällig", cls: "text-destructive bg-destructive/10 border-destructive/20", icon: AlertTriangle };
  if (days <= 14) return { label: "Dringend", cls: "text-warning bg-warning/10 border-warning/20", icon: AlertTriangle };
  if (days <= 60) return { label: "Bald", cls: "text-primary bg-primary/10 border-primary/20", icon: Clock };
  return { label: "Geplant", cls: "text-success bg-success/10 border-success/20", icon: CheckCircle2 };
};

const catBadge: Record<Deadline["category"], { label: string; cls: string }> = {
  steuer: { label: "Steuer", cls: "bg-info/10 text-info" },
  miete: { label: "Miete", cls: "bg-primary/10 text-primary" },
  betrieb: { label: "Betrieb", cls: "bg-warning/10 text-warning" },
  recht: { label: "Recht", cls: "bg-success/10 text-success" },
};

const Deadlines = () => {
  useEffect(() => { document.title = "Fristen · ImmonIQ"; }, []);
  const now = new Date();
  const items = useMemo(() => {
    return buildDeadlines().map((d) => ({
      ...d,
      daysLeft: Math.ceil((d.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    })).sort((a, b) => a.daysLeft - b.daysLeft);
  }, [now]);

  const groups = {
    urgent: items.filter(i => i.daysLeft <= 14),
    soon: items.filter(i => i.daysLeft > 14 && i.daysLeft <= 60),
    later: items.filter(i => i.daysLeft > 60),
  };

  return (
    <Stagger className="space-y-6 max-w-4xl">
      <Item>
        <div>
          <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">Compliance</p>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
            Gesetzliche <span className="text-gradient-gold">Fristen</span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Automatisch überwacht. Jede Frist verlinkt den Original-Paragraphen, damit du
            alles nachprüfen kannst.
          </p>
        </div>
      </Item>

      <Item>
        <div className="grid sm:grid-cols-3 gap-3">
          <Card className="p-5 glass border-destructive/20">
            <p className="text-xs text-muted-foreground">Dringend</p>
            <p className="text-3xl font-bold mt-1 text-destructive tabular">{groups.urgent.length}</p>
            <p className="text-xs text-muted-foreground mt-1">≤ 14 Tage</p>
          </Card>
          <Card className="p-5 glass border-primary/20">
            <p className="text-xs text-muted-foreground">Bald</p>
            <p className="text-3xl font-bold mt-1 text-primary tabular">{groups.soon.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Nächste 2 Monate</p>
          </Card>
          <Card className="p-5 glass">
            <p className="text-xs text-muted-foreground">Geplant</p>
            <p className="text-3xl font-bold mt-1 tabular">{groups.later.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Später</p>
          </Card>
        </div>
      </Item>

      <div className="space-y-3">
        {items.map((d) => {
          const t = tone(d.daysLeft);
          return (
            <Item key={d.id}>
              <Card className="p-5 glass interactive-card">
                <div className="flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${t.cls}`}>
                    <t.icon className="h-[18px] w-[18px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{d.title}</h3>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${catBadge[d.category].cls}`}>
                            {catBadge[d.category].label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{d.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{date(d.dueDate)}</p>
                        <p className={`text-sm font-bold tabular ${
                          d.daysLeft < 0 ? "text-destructive" : d.daysLeft <= 14 ? "text-warning" : ""
                        }`}>
                          {d.daysLeft < 0 ? `${Math.abs(d.daysLeft)} Tage überfällig` :
                           d.daysLeft === 0 ? "Heute" :
                           `${new Intl.NumberFormat("de-DE").format(d.daysLeft)} Tage`}
                        </p>
                      </div>
                    </div>
                    {d.law && (
                      <a
                        href={d.law.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-3"
                      >
                        {d.law.label} nachlesen <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            </Item>
          );
        })}
      </div>
    </Stagger>
  );
};

export default Deadlines;
