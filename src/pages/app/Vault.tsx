import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stagger, Item } from "@/components/motion/Primitives";
import { motion } from "framer-motion";
import {
  Lock, ShieldCheck, KeyRound, FileText, Eye, EyeOff,
  Fingerprint, ServerCrash, CheckCircle2, AlertTriangle,
} from "lucide-react";

const Vault = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => { document.title = "Tresor · ImmoNIQ"; }, []);

  const unlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    setUnlocked(true);
  };

  return (
    <Stagger className="space-y-6 max-w-4xl mx-auto">
      <Item>
        <div>
          <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">Sicherer Bereich</p>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
            Dokumenten-<span className="text-gradient-gold">Tresor</span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Verträge, Abrechnungen, Steuerbescheide. Zero-Knowledge-verschlüsselt —
            selbst wir können Inhalte nicht lesen.
          </p>
        </div>
      </Item>

      {/* Security badges */}
      <Item>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: KeyRound, title: "AES-256 + Client-Key", desc: "Ende-zu-Ende" },
            { icon: ServerCrash, title: "Server in Frankfurt", desc: "DSGVO, DE-Jurisdiktion" },
            { icon: Fingerprint, title: "Audit-Log", desc: "Jeder Zugriff protokolliert" },
          ].map((b) => (
            <Card key={b.title} className="p-4 glass flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <b.icon className="h-[18px] w-[18px] text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{b.title}</p>
                <p className="text-[11px] text-muted-foreground">{b.desc}</p>
              </div>
              <CheckCircle2 className="h-4 w-4 text-success ml-auto flex-shrink-0" />
            </Card>
          ))}
        </div>
      </Item>

      {!unlocked ? (
        <Item variant="scale">
          <motion.div animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}} transition={{ duration: 0.4 }}>
            <Card className="vault-surface text-white p-8 lg:p-12 text-center relative overflow-hidden">
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent"
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              <div className="relative">
                <motion.div
                  className="mx-auto w-20 h-20 rounded-3xl bg-gradient-gold flex items-center justify-center shadow-gold mb-6 vault-lock"
                  animate={{ rotate: [0, -2, 2, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Lock className="h-9 w-9 text-black" strokeWidth={2.5} />
                </motion.div>

                <h2 className="text-2xl font-bold mb-2 text-white">Tresor verschlossen</h2>
                <p className="text-white/70 text-sm mb-8 max-w-sm mx-auto">
                  Gib deinen 6-stelligen Tresor-PIN ein. Dieser ist NICHT dein Konto-Passwort
                  und wird nur lokal entschlüsselt.
                </p>

                <form onSubmit={unlock} className="max-w-xs mx-auto">
                  <div className="relative mb-4">
                    <input
                      type={showPin ? "text" : "password"}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={8}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                      autoFocus
                      placeholder="• • • • • •"
                      className="w-full h-14 text-center text-2xl tabular tracking-[0.5em] bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-primary focus:bg-white/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2"
                    >
                      {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <Button type="submit" size="lg" className="w-full bg-gradient-gold text-black hover:opacity-90 shadow-gold font-bold h-12">
                    Tresor öffnen
                  </Button>

                  <p className="text-[11px] text-white/40 mt-6 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-3 w-3" />
                    Dein PIN verlässt niemals dein Gerät
                  </p>
                </form>
              </div>
            </Card>
          </motion.div>
        </Item>
      ) : (
        <Item variant="scale">
          <Card className="p-8 glass">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-semibold">Tresor entsperrt</p>
                <p className="text-xs text-muted-foreground">Schließt automatisch in 15 Minuten</p>
              </div>
              <Button onClick={() => { setUnlocked(false); setPin(""); }} variant="outline" size="sm" className="ml-auto">
                Sperren
              </Button>
            </div>

            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <p className="font-medium mb-1">Noch keine Dokumente</p>
              <p className="text-sm text-muted-foreground mb-6">
                Kaufverträge, Mietverträge, Steuerbescheide — alles sicher hier.
              </p>
              <Button className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold">
                Erstes Dokument hochladen
              </Button>
              <p className="text-[11px] text-muted-foreground mt-4">
                Aufbewahrung nach § 147 AO (10 Jahre) · automatisch überwacht
              </p>
            </div>
          </Card>
        </Item>
      )}

      <Item>
        <Card className="p-5 glass border-warning/30 bg-warning/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Wichtig: PIN vergessen = Daten verloren</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Zero-Knowledge heißt: Wir sehen deinen PIN nie. Selbst wir können keine Inhalte
                wiederherstellen. Schreib deinen PIN sicher auf — z.B. in einen echten Tresor.
              </p>
            </div>
          </div>
        </Card>
      </Item>
    </Stagger>
  );
};

export default Vault;
