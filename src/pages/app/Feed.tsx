import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Sparkles, PartyPopper, Lightbulb, TrendingUp, Receipt, Calculator, Megaphone, Trophy, Plus, Hand } from "lucide-react";
import { motion } from "framer-motion";
import { eur } from "@/lib/format";
import { toast } from "sonner";
import { Stagger, Item } from "@/components/motion/Primitives";

type Win = {
  id: string;
  user_id: string;
  kind: string;
  amount_eur: number | null;
  zip_prefix: string | null;
  city: string | null;
  message: string | null;
  reactions_count: number;
  created_at: string;
};

const KIND_META: Record<string, { icon: any; label: string; color: string }> = {
  tax_saved: { icon: Calculator, label: "Steuer gespart", color: "text-success" },
  receipts_added: { icon: Receipt, label: "Belege erfasst", color: "text-primary" },
  nka_done: { icon: Calculator, label: "NK-Abrechnung", color: "text-primary" },
  listing_published: { icon: Megaphone, label: "Inserat live", color: "text-blue-500" },
  tenant_added: { icon: Trophy, label: "Mieter dazu", color: "text-primary" },
  milestone: { icon: TrendingUp, label: "Meilenstein", color: "text-success" },
  tip: { icon: Lightbulb, label: "Tipp", color: "text-amber-500" },
};

const Feed = () => {
  const [wins, setWins] = useState<Win[]>([]);
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState<any[]>([]);
  const [reacted, setReacted] = useState<Set<string>>(new Set());
  const [me, setMe] = useState<string | null>(null);
  const [canPost, setCanPost] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [tipText, setTipText] = useState("");

  useEffect(() => {
    document.title = "Community-Feed · ImmonIQ";
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id ?? null;
      setMe(uid);
      if (uid) {
        const { data: props } = await supabase.from("properties").select("id").eq("user_id", uid).limit(1);
        setCanPost((props?.length ?? 0) > 0);
      }
      const [{ data: w }, { data: p }, { data: r }] = await Promise.all([
        supabase.from("community_wins").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("market_pulse").select("*").order("created_at", { ascending: false }).limit(6),
        uid
          ? supabase.from("win_reactions").select("win_id").eq("user_id", uid)
          : Promise.resolve({ data: [] as { win_id: string }[] }),
      ]);
      setWins((w as Win[]) ?? []);
      setPulse(p ?? []);
      setReacted(new Set(((r as { win_id: string }[]) ?? []).map((x) => x.win_id)));
      setLoading(false);
    })();
  }, []);

  const applaud = async (winId: string) => {
    if (!me) {
      toast.error("Bitte einloggen für Reaktionen.");
      return;
    }
    const has = reacted.has(winId);
    // optimistic
    setReacted((s) => {
      const n = new Set(s);
      has ? n.delete(winId) : n.add(winId);
      return n;
    });
    setWins((ws) =>
      ws.map((w) => (w.id === winId ? { ...w, reactions_count: w.reactions_count + (has ? -1 : 1) } : w))
    );
    if (has) {
      await supabase.from("win_reactions").delete().eq("win_id", winId).eq("user_id", me);
    } else {
      await supabase.from("win_reactions").insert({ win_id: winId, user_id: me });
    }
  };

  const postTip = async () => {
    if (!tipText.trim() || tipText.length > 280) {
      toast.error("Tipp darf max. 280 Zeichen haben.");
      return;
    }
    const { error } = await supabase.rpc("record_user_activity", {
      _kind: "tip",
      _amount: null,
      _message: tipText.trim(),
      _zip: null,
      _city: null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Danke für deinen Tipp! 💡");
    setTipOpen(false);
    setTipText("");
    // reload wins
    const { data: w } = await supabase
      .from("community_wins")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setWins((w as Win[]) ?? []);
  };

  return (
    <Stagger className="space-y-6 max-w-3xl">
      <Item>
        <header className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">
              Win-Win Feed
            </p>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Was die <span className="text-gradient-gold">Community</span> diese Woche schafft
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm">
              Anonyme Erfolge & ehrliche Tipps von verifizierten Eigentümern. Kein Reichtums-Flex, keine Klarnamen — nur Wissen, das hilft.
            </p>
          </div>
          {canPost && (
            <Dialog open={tipOpen} onOpenChange={setTipOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-gold text-primary-foreground shadow-gold">
                  <Plus className="h-4 w-4 mr-2" /> Tipp teilen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Was hast du letzte Woche gelernt?</DialogTitle>
                </DialogHeader>
                <p className="text-xs text-muted-foreground">
                  Anonym, max. 280 Zeichen. Keine Adressen, keine Klarnamen, kein Spam.
                </p>
                <Textarea
                  value={tipText}
                  onChange={(e) => setTipText(e.target.value)}
                  maxLength={280}
                  rows={4}
                  placeholder="z. B. „§7b nicht vergessen — bei Neubau bis 2026 gibt's 5% Sonder-AfA on top."
                />
                <p className="text-[10px] text-muted-foreground text-right">{tipText.length}/280</p>
                <DialogFooter>
                  <Button onClick={postTip} className="bg-gradient-gold text-primary-foreground">
                    Tipp posten
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </header>
      </Item>

      {/* Market Pulse */}
      {pulse.length > 0 && (
        <Item>
          <Card className="p-5 glass bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary" />
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Markt-Puls dieser Woche
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pulse.map((p) => (
                <div key={p.id} className="p-3 rounded-xl bg-background/40 border border-border/40">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {p.city ?? p.zip_prefix ?? "DE"} · {p.metric}
                  </p>
                  <p className="text-lg font-bold mt-1">{p.value}</p>
                  {p.delta_pct != null && (
                    <p className={`text-xs ${Number(p.delta_pct) >= 0 ? "text-success" : "text-destructive"}`}>
                      {Number(p.delta_pct) >= 0 ? "▲" : "▼"} {Math.abs(Number(p.delta_pct))}%
                    </p>
                  )}
                  {p.caption && <p className="text-xs text-muted-foreground mt-1">{p.caption}</p>}
                </div>
              ))}
            </div>
          </Card>
        </Item>
      )}

      {/* Wins */}
      {loading ? (
        <Item>
          <Card className="p-10 text-center glass">
            <Sparkles className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3 animate-pulse" />
            <p className="text-sm text-muted-foreground">Lade Erfolge…</p>
          </Card>
        </Item>
      ) : wins.length === 0 ? (
        <Item>
          <Card className="p-10 text-center glass">
            <PartyPopper className="h-12 w-12 text-primary/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Noch keine Wins. Sei der/die Erste — erfasse einen Beleg, schließe deine NK ab, oder teile einen Tipp.
            </p>
          </Card>
        </Item>
      ) : (
        wins.map((w) => {
          const meta = KIND_META[w.kind] ?? KIND_META.milestone;
          const Icon = meta.icon;
          const has = reacted.has(w.id);
          return (
            <Item key={w.id}>
              <Card className="p-5 glass interactive-card">
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px]">{meta.label}</Badge>
                      {w.zip_prefix && (
                        <Badge variant="outline" className="text-[10px]">PLZ {w.zip_prefix}xxx</Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {timeAgo(w.created_at)}
                      </span>
                    </div>
                    {w.amount_eur != null && (
                      <p className="text-xl font-bold mt-2 text-gradient-gold">
                        {eur(Number(w.amount_eur))}
                      </p>
                    )}
                    {w.message && (
                      <p className="text-sm mt-2 leading-relaxed text-foreground/90">
                        {w.kind === "tip" ? "💡 " : ""}{w.message}
                      </p>
                    )}
                    <button
                      onClick={() => applaud(w.id)}
                      className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        has
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted hover:bg-muted/80 text-foreground"
                      }`}
                    >
                      <motion.span
                        animate={has ? { rotate: [0, -20, 20, -10, 0] } : {}}
                        transition={{ duration: 0.4 }}
                      >
                        <Hand className="h-3.5 w-3.5" />
                      </motion.span>
                      Applaus
                      <span className="opacity-70">· {w.reactions_count}</span>
                    </button>
                  </div>
                </div>
              </Card>
            </Item>
          );
        })
      )}

      <Item>
        <p className="text-[10px] text-muted-foreground text-center pt-4">
          Alle Posts anonym · keine Klarnamen, keine Adressen · nur verifizierte Eigentümer dürfen posten
        </p>
      </Item>
    </Stagger>
  );
};

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "gerade eben";
  if (s < 3600) return `vor ${Math.floor(s / 60)}m`;
  if (s < 86400) return `vor ${Math.floor(s / 3600)}h`;
  return `vor ${Math.floor(s / 86400)}d`;
}

export default Feed;
