import { Link } from "react-router-dom";

export default function AGB() {
  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Zurück</Link>
        <h1 className="text-3xl font-bold">Allgemeine Geschäftsbedingungen</h1>

        <section className="space-y-2 text-sm">
          <h2 className="text-lg font-semibold">§ 1 Geltungsbereich</h2>
          <p>Diese AGB gelten für die Nutzung von ImmonIQ (Anbieter: Leon Boomgaarden / ENTERVENTUS).</p>
        </section>

        <section className="space-y-2 text-sm">
          <h2 className="text-lg font-semibold">§ 2 Vertragsschluss & Testphase</h2>
          <p>Der Vertrag kommt mit Registrierung zustande. Die ersten <strong>30 Tage sind kostenlos</strong>. Danach gilt der gewählte Tarif.</p>
        </section>

        <section className="space-y-2 text-sm">
          <h2 className="text-lg font-semibold">§ 3 Laufzeit & Kündigung</h2>
          <p>Monatliche Laufzeit, kündbar zum Monatsende ohne Angabe von Gründen — direkt in den App-Einstellungen.</p>
        </section>

        <section className="space-y-2 text-sm">
          <h2 className="text-lg font-semibold">§ 4 Leistungsumfang</h2>
          <p>
            ImmonIQ ist ein Werkzeug zur Selbstverwaltung. Wir <strong>geben keine Steuer- oder Rechtsberatung</strong>.
            Generierte Reports sind Arbeitshilfen — die rechtliche/steuerliche Bewertung erfolgt
            durch einen qualifizierten Berater.
          </p>
        </section>

        <section className="space-y-2 text-sm">
          <h2 className="text-lg font-semibold">§ 5 Haftung</h2>
          <p>Haftung nur bei Vorsatz und grober Fahrlässigkeit. Für leichte Fahrlässigkeit nur bei Verletzung wesentlicher Vertragspflichten und begrenzt auf den vorhersehbaren Schaden.</p>
        </section>

        <section className="space-y-2 text-sm">
          <h2 className="text-lg font-semibold">§ 6 Datenexport bei Kündigung</h2>
          <p>Nach Kündigung können alle Daten 30 Tage lang als CSV/PDF exportiert werden. Danach werden sie gelöscht (Ausnahme: gesetzliche Aufbewahrungspflichten).</p>
        </section>

        <section className="space-y-2 text-sm">
          <h2 className="text-lg font-semibold">§ 7 Änderungen</h2>
          <p>Änderungen werden mind. 30 Tage vorher per E-Mail angekündigt. Widerspruch möglich = Sonderkündigungsrecht.</p>
        </section>
      </div>
    </div>
  );
}
