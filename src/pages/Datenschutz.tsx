import { Link } from "react-router-dom";

export default function Datenschutz() {
  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Zurück</Link>
        <h1 className="text-3xl font-bold">Datenschutzerklärung</h1>

        <section className="space-y-2 text-sm">
          <h2 className="text-lg font-semibold">1. Verantwortlicher</h2>
          <p>Leon Boomgaarden, Kastanienallee 13, 59320 Ennigerloh — leonboomgaarden@gmail.com</p>
        </section>

        <section className="space-y-2 text-sm">
          <h2 className="text-lg font-semibold">2. Verarbeitete Daten</h2>
          <p>
            Wir verarbeiten die von dir bei der Registrierung angegebenen Daten (E-Mail, Passwort gehasht)
            sowie alle Daten, die du in der App eingibst (Objekte, Mieter, Zahlungen, Belege, Dokumente).
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
          </p>
        </section>

        <section className="space-y-2 text-sm">
          <h2 className="text-lg font-semibold">3. Auftragsverarbeitung</h2>
          <p>
            Hosting & Datenbank: Supabase (Server-Standort EU/Irland) — DSGVO-konformer
            Auftragsverarbeitungsvertrag liegt vor. Übertragung verschlüsselt via TLS 1.3,
            Speicherung verschlüsselt at-rest (AES-256). Tresor-Dokumente werden zusätzlich
            client-seitig verschlüsselt (Zero-Knowledge).
          </p>
        </section>

        <section className="space-y-2 text-sm">
          <h2 className="text-lg font-semibold">4. Deine Rechte</h2>
          <p>
            Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch
            (Art. 15–22 DSGVO). Beschwerden an die zuständige Aufsichtsbehörde sind möglich.
            Anfragen an: leonboomgaarden@gmail.com.
          </p>
        </section>

        <section className="space-y-2 text-sm">
          <h2 className="text-lg font-semibold">5. Cookies & Tracking</h2>
          <p>Wir setzen ausschließlich technisch notwendige Cookies (Session-Token). Kein Tracking, keine Werbe-Cookies.</p>
        </section>

        <section className="space-y-2 text-sm">
          <h2 className="text-lg font-semibold">6. Speicherdauer</h2>
          <p>
            Daten bleiben bis zur Kündigung gespeichert. Nach Kündigung erfolgt Export-Möglichkeit
            für 30 Tage, anschließend Löschung. Steuerlich relevante Daten können bis zu 10 Jahre
            aufbewahrt werden (§ 147 AO).
          </p>
        </section>
      </div>
    </div>
  );
}
