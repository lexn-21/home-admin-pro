import { Link } from "react-router-dom";

export default function Impressum() {
  return (
    <div className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Zurück</Link>
        <h1 className="text-3xl font-bold">Impressum</h1>
        <p className="text-sm text-muted-foreground">Angaben gemäß § 5 TMG</p>

        <div className="space-y-2 text-sm">
          <p className="font-semibold">Leon Boomgaarden</p>
          <p>Geschäftsbezeichnung: ENTERVENTUS</p>
          <p>Kastanienallee 13</p>
          <p>59320 Ennigerloh</p>
          <p>Deutschland</p>
        </div>

        <div className="space-y-2 text-sm">
          <p><strong>Kontakt</strong></p>
          <p>Telefon: +49 152 28943502</p>
          <p>E-Mail: <a href="mailto:leonboomgaarden@gmail.com" className="text-primary">leonboomgaarden@gmail.com</a></p>
        </div>

        <div className="space-y-2 text-sm">
          <p><strong>Umsatzsteuer-ID</strong></p>
          <p>USt-ID: DE365353142</p>
          <p>Hinweis: Kleinunternehmer gem. § 19 UStG — keine Umsatzsteuer ausgewiesen.</p>
        </div>

        <p className="text-xs text-muted-foreground pt-4">
          Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV: Leon Boomgaarden, Anschrift wie oben.
        </p>
      </div>
    </div>
  );
}
