import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Flame, Trophy, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

type Stats = {
  level: number;
  points: number;
  weekly_streak: number;
  total_wins: number;
  pseudonym: string | null;
};

const LEVEL_NAMES = ["", "Einsteiger", "Bronze", "Silber", "Gold", "Platin"];
const NEXT_AT = [0, 200, 400, 600, 800, 1000];

export const WinsWidget = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return setLoading(false);
      const { data } = await supabase
        .from("user_stats")
        .select("level,points,weekly_streak,total_wins,pseudonym")
        .eq("user_id", u.user.id)
        .maybeSingle();
      if (data) setStats(data as Stats);
      else {
        // create row
        await supabase.from("user_stats").insert({ user_id: u.user.id });
        setStats({ level: 1, points: 0, weekly_streak: 0, total_wins: 0, pseudonym: null });
      }
      setLoading(false);
    })();
  }, []);

  if (loading || !stats) return null;

  const nextLevelAt = NEXT_AT[Math.min(stats.level, 5)] || 1000;
  const prevLevelAt = NEXT_AT[Math.max(0, stats.level - 1)] || 0;
  const span = nextLevelAt - prevLevelAt || 1;
  const progress = Math.min(100, Math.max(0, ((stats.points - prevLevelAt) / span) * 100));

  return (
    <Card className="p-5 glass bg-gradient-to-br from-primary/8 to-transparent border-primary/20 overflow-hidden relative">
      <motion.div
        className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/15 blur-3xl"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
            Deine Wins
          </p>
          <Link to="/app/feed" className="text-xs text-primary hover:underline flex items-center gap-1">
            Community-Feed <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-gold flex items-center justify-center text-primary-foreground shadow-gold flex-shrink-0">
            <Trophy className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold leading-tight">
              Level {stats.level} · {LEVEL_NAMES[stats.level] ?? "Profi"}
            </p>
            <p className="text-xs text-muted-foreground">
              {stats.points} Punkte · {stats.total_wins} Erfolge
            </p>
          </div>
        </div>

        {/* Progress to next level */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Fortschritt</span>
            <span>{stats.points} / {nextLevelAt}</span>
          </div>
          <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-gold"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <Flame className="h-5 w-5 text-orange-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-lg font-bold leading-tight">{stats.weekly_streak}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {stats.weekly_streak === 1 ? "Woche aktiv" : "Wochen aktiv"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-lg font-bold leading-tight">{stats.total_wins}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Erfolge gesamt</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
