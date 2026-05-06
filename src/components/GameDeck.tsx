import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck, Trophy, Target, Home, Users, Receipt,
  FileCheck, Megaphone, Calculator, Flame, CheckCircle2, ChevronRight, Clock,
} from "lucide-react";

type Score = { score: number; completeness: number; activity: number; accounting: number; nka: number; streak_bonus: number };
type Achievement = { code: string; title: string; description: string; icon: string; tier: string; sort_order: number };
type Quest = { code: string; title: string; description: string; metric: string; target: number; reward_points: number };

const ICON_MAP: Record<string, any> = {
  trophy: Trophy, home: Home, users: Users, receipt: Receipt,
  "file-check": FileCheck, megaphone: Megaphone, calculator: Calculator,
  flame: Flame, "shield-check": ShieldCheck,
};

// Tax deadline: 31. Juli of year+1 for previous year's filing.
function taxDeadline() {
  const now = new Date();
  const y = now.getFullYear();
  // Belege werden für das vorherige Steuerjahr gesammelt; Frist 31.07. des Folgejahres
  const taxYear = y - (now.getMonth() < 7 ? 1 : 0); // bis Juli sammeln wir noch fürs Vorjahr
  const deadline = new Date(taxYear + 1, 6, 31); // Juli = 6
  const days = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / 86400000));
  return { taxYear, days, deadline };
}

export const GameDeck = () => {
  const [score, setScore] = useState<Score | null>(null);
  const [defs, setDefs] = useState<Achievement[]>([]);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [quests, setQuests] = useState<Quest[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [yearReceipts, setYearReceipts] = useState(0);
  const [loading, setLoading] = useState(true);

  const tax = useMemo(taxDeadline, []);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return setLoading(false);
      await supabase.rpc("evaluate_achievements");
      const yearStart = new Date(tax.taxYear, 0, 1).toISOString();
      const yearEnd = new Date(tax.taxYear + 1, 0, 1).toISOString();
      const [s, d, ua, qq, exp, nka, lst, expYear] = await Promise.all([
        supabase.rpc("calc_landlord_score", { _user_id: u.user.id }),
        supabase.from("achievements").select("*").order("sort_order"),
        supabase.from("user_achievements").select("code"),
        supabase.from("quests").select("*").eq("active", true).order("sort_order"),
        supabase.from("expenses").select("created_at,receipt_path").eq("user_id", u.user.id)
          .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),
        supabase.from("nka_periods").select("status,updated_at").eq("user_id", u.user.id),
        supabase.from("listings").select("status,published_at").eq("user_id", u.user.id),
        supabase.from("expenses").select("id", { count: "exact", head: true }).eq("user_id", u.user.id)
          .not("receipt_path", "is", null).gte("spent_on", yearStart.slice(0, 10)).lt("spent_on", yearEnd.slice(0, 10)),
      ]);
      setScore(s.data as Score);
      setDefs((d.data || []) as Achievement[]);
      setUnlocked(new Set((ua.data || []).map((r: any) => r.code)));
      setQuests((qq.data || []) as Quest[]);
      setYearReceipts(expYear.count || 0);

      const w = Date.now() - 7 * 86400000, m = Date.now() - 30 * 86400000;
      const E = exp.data || [], N = nka.data || [], L = lst.data || [];
      setProgress({
        q_receipts_5: E.filter((e: any) => e.receipt_path && new Date(e.created_at).getTime() > w).length,
        q_receipts_20: E.filter((e: any) => e.receipt_path && new Date(e.created_at).getTime() > m).length,
        q_nka_done: N.filter((n: any) => n.status === "done" && new Date(n.updated_at).getTime() > m).length,
        q_listing: L.filter((l: any) => l.status === "published" && l.published_at && new Date(l.published_at).getTime() > m).length,
      });
      setLoading(false);
    })();
  }, [tax.taxYear]);

  if (loading || !score) return null;

  const nextQuest = quests
    .map(q => ({ ...q, p: progress[q.code] || 0 }))
    .filter(q => q.p < q.target)[0];

  const scoreColor =
    score.score >= 80 ? "text-emerald-500" :
    score.score >= 60 ? "text-primary" :
    score.score >= 40 ? "text-amber-500" : "text-muted-foreground";

  // Trophäen: nur die 3 nächsten erreichbaren anzeigen
  const lockedDefs = defs.filter(a => !unlocked.has(a.code));
  const nextThreeLocked = lockedDefs.slice(0, 3);
  const remainingLocked = Math.max(0, lockedDefs.length - nextThreeLocked.length);
  const unlockedDefs = defs.filter(a => unlocked.has(a.code));

  // Deadline-Druck als sanfter Reminder
  const deadlineUrgent = tax.days <= 60;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="p-3 glass cursor-pointer hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className={`text-lg font-bold tabular-nums ${scoreColor}`}>{score.score}</span>
              <span className="text-[10px] text-muted-foreground">/100</span>
            </div>
            <div className="h-6 w-px bg-border/60" />
            {nextQuest ? (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">{nextQuest.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="h-1 flex-1 rounded-full bg-muted/60 overflow-hidden max-w-[120px]">
                    <div className="h-full bg-primary" style={{ width: `${Math.min(100, (nextQuest.p / nextQuest.target) * 100)}%` }} />
                  </div>
                  <span className="text-[10px] tabular-nums text-muted-foreground">{nextQuest.p}/{nextQuest.target}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground flex-1">Alle Missionen erledigt 🎉</p>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
              <Trophy className="h-3.5 w-3.5" />
              <span className="tabular-nums">{unlocked.size}/{defs.length}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Portfolio-Score
          </DialogTitle>
          <p className="text-xs text-muted-foreground pt-1">
            Wie gesund & vollständig dein Vermieter-Setup ist. (Dein <span className="font-medium text-foreground">Level</span> misst dagegen deine Aktivität.)
          </p>
        </DialogHeader>

        <div className="space-y-5">
          {/* Score breakdown */}
          <div>
            <div className="flex items-end gap-3 mb-3">
              <span className={`text-4xl font-bold tabular-nums ${scoreColor}`}>{score.score}</span>
              <span className="text-sm text-muted-foreground mb-1">/ 100</span>
            </div>
            <div className="space-y-1.5">
              {[
                { label: "Stammdaten", val: score.completeness, max: 25 },
                { label: "Aktivität", val: score.activity, max: 25 },
                { label: "Buchhaltung", val: score.accounting, max: 25 },
                { label: "Abrechnungen", val: score.nka, max: 15 },
                { label: "Streak-Bonus", val: score.streak_bonus, max: 10 },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-2 text-xs">
                  <span className="w-28 text-muted-foreground">{b.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                    <div className="h-full bg-primary/70" style={{ width: `${(b.val / b.max) * 100}%` }} />
                  </div>
                  <span className="w-10 text-right tabular-nums text-muted-foreground">{b.val}/{b.max}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Steuer-Deadline Mission */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2 flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> Steuer-Frist
            </p>
            <div className={`p-3 rounded-lg border ${deadlineUrgent ? "border-amber-500/40 bg-amber-500/5" : "border-border/60 bg-muted/30"}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">Belege für Steuer {tax.taxYear}</p>
                <Badge variant={deadlineUrgent ? "default" : "outline"} className="text-[10px]">
                  noch {tax.days} {tax.days === 1 ? "Tag" : "Tage"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {yearReceipts} {yearReceipts === 1 ? "Beleg" : "Belege"} erfasst · Frist 31.07.{tax.taxYear + 1}
              </p>
            </div>
          </div>

          {/* Active quests */}
          {quests.some(q => (progress[q.code] || 0) < q.target) && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2 flex items-center gap-1.5">
                <Target className="h-3 w-3" /> Missionen
              </p>
              <div className="space-y-2">
                {quests.map(q => {
                  const p = progress[q.code] || 0;
                  if (p >= q.target) return null;
                  return (
                    <div key={q.code} className="p-2.5 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{q.title}</p>
                        <Badge variant="outline" className="text-[10px]">+{q.reward_points}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${Math.min(100, (p / q.target) * 100)}%` }} />
                        </div>
                        <span className="text-[10px] tabular-nums text-muted-foreground">{p}/{q.target}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trophies — nur 3 nächste + bereits erreichte */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2 flex items-center gap-1.5">
              <Trophy className="h-3 w-3" /> Trophäen · {unlocked.size}/{defs.length}
            </p>

            {unlockedDefs.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                {unlockedDefs.map(a => {
                  const Icon = ICON_MAP[a.icon] || Trophy;
                  return (
                    <div
                      key={a.code}
                      title={a.description}
                      className="p-2 rounded-lg border bg-primary/5 border-primary/30 text-center"
                    >
                      <Icon className="h-4 w-4 mx-auto mb-1 text-primary" />
                      <p className="text-[10px] font-medium leading-tight">{a.title}</p>
                      <CheckCircle2 className="h-2.5 w-2.5 mx-auto mt-1 text-emerald-500" />
                    </div>
                  );
                })}
              </div>
            )}

            {nextThreeLocked.length > 0 && (
              <>
                <p className="text-[10px] text-muted-foreground mb-1.5">Als Nächstes erreichbar:</p>
                <div className="space-y-1.5">
                  {nextThreeLocked.map(a => {
                    const Icon = ICON_MAP[a.icon] || Trophy;
                    return (
                      <div key={a.code} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/50">
                        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{a.title}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{a.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {remainingLocked > 0 && (
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    +{remainingLocked} weitere Trophäen warten
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
