## Vision: Der ImmoNIQ Markt — „ImmoScout × Indeed"

Eigentümer veröffentlichen mit einem Klick aus ihrem bestehenden Objekt/Einheit ein Inserat (Miete oder Verkauf). Suchende erstellen ein **Bewerber-Profil** (wie Indeed-Lebenslauf: Bonität, Einkommen, Haushalt, SCHUFA-Bereitschaft) und bewerben sich in einem Klick. Eigentümer sehen alle Bewerbungen strukturiert, vergleichen, chatten, sagen zu — fertig.

**Warum das der Killer ist:**
- Daten sind schon da (Tresor, Einheiten, Mieten, AVM) → 1-Klick-Listing statt 30 Min ImmoScout-Formular
- Bewerber-Profil wird **wiederverwendet** (Indeed-Effekt) → Netzwerkeffekt
- Wir sitzen auf Verifikation (E-Mail-Auth + optional SCHUFA-Upload im Tresor) → Vertrauen
- Take-Rate-Optionen später: Premium-Listing, verifiziertes Bewerber-Badge, Provision bei Verkauf

---

## Was gebaut wird (Phase 1 — MVP)

### A) Datenbank (neue Tabellen + RLS)

```text
listings                  ← öffentliche Inserate
├── id, user_id (Eigentümer), property_id, unit_id (optional)
├── kind: 'rent' | 'sale'
├── status: 'draft' | 'published' | 'paused' | 'closed'
├── title, description, photos[] (storage paths)
├── price, deposit, available_from, min_term_months
├── living_space, rooms, zip, city, street_public (optional)
├── features: jsonb (Balkon, EBK, Haustiere, …)
├── views_count, applications_count
└── published_at, expires_at

seeker_profiles           ← Bewerber-„Lebenslauf" (Indeed-Style)
├── user_id (unique), full_name, phone, email_verified
├── household_size, has_pets, smoker
├── net_income_monthly, employment_type ('unbefristet'|…)
├── schufa_status: 'unverified'|'self_declared'|'document_uploaded'
├── move_in_from, max_rent, preferred_zips[]
├── about_me (Vorstellung), profile_photo
└── completeness_score (0-100, für Ranking)

applications              ← Bewerbung auf ein Listing
├── id, listing_id, seeker_user_id, owner_user_id
├── status: 'sent'|'shortlisted'|'rejected'|'accepted'|'withdrawn'
├── cover_message
├── snapshot_profile: jsonb (eingefroren bei Bewerbung)
├── created_at, owner_seen_at
└── unique(listing_id, seeker_user_id)

listing_messages          ← 1:1 Chat zwischen Owner & Seeker
├── id, application_id, sender_user_id, body, created_at, read_at

listing_saves             ← Suchende speichern Listings (Wishlist)
└── (user_id, listing_id) unique

listing_alerts            ← Job-Alert-Style Suchaufträge
├── user_id, kind ('rent'|'sale'), zips[], max_price, min_rooms
└── active, last_notified_at
```

**Storage**: neuer öffentlicher Bucket `listing-photos` (lesbar für alle, schreibbar nur Owner).

**RLS-Logik (kritisch):**
- `listings`: SELECT öffentlich nur wenn `status='published'`; alles sonst nur Owner
- `seeker_profiles`: Owner darf Profil sehen **nur** wenn Seeker sich auf sein Listing beworben hat (über SECURITY DEFINER Function `can_view_seeker(seeker_id, viewer_id)`)
- `applications`: sichtbar für Seeker (eigene) + Owner (eigene Listings)
- `listing_messages`: nur Teilnehmer der Application

### B) Eigentümer-Seite (in der App)

1. **„Veröffentlichen"-Button** auf `PropertyDetail` und `Properties`-Karten
   - Wizard 3 Schritte: Daten prüfen (vorausgefüllt aus Unit) → Fotos + Beschreibung → Preis & Verfügbarkeit → Veröffentlichen
   - „Mit AVM-Vorschlag bepreisen"-Button (nutzt vorhandenen `avm_estimate`)
2. **Neue Seite `/app/listings`** — meine Inserate, Status, Statistiken (Views, Bewerbungen)
3. **`/app/listings/:id/applications`** — Bewerber-Inbox mit Vergleichstabelle
   - Spalten: Foto, Name, Einkommen, Haushalt, SCHUFA-Status, Match-Score
   - Aktionen: Shortlist · Ablehnen · Chat · Annehmen → erzeugt automatisch Tenant-Eintrag

### C) Suchende-Seite

1. **Öffentliche Marktplatz-Seite `/markt`** (kein Login zum Stöbern)
   - Filter: Stadt/PLZ, Miete vs. Kauf, Preis, Zimmer, m², Verfügbar ab
   - Kartenansicht (wir haben Maps schon im Marktplatz) + Listenansicht
2. **Listing-Detail `/markt/:id`** — Galerie, Beschreibung, Karte, „Bewerben"-Button (Login required)
3. **`/app/profile-seeker`** — Bewerber-Lebenslauf erstellen/pflegen, Completeness-Bar
4. **`/app/applications`** — meine Bewerbungen, Status, Chats, gespeicherte Listings
5. **Suchaufträge** — „Benachrichtige mich bei neuen Wohnungen in 80331, max 1.500 €"

### D) Cross-Cutting

- **DSGVO**: Bewerbungsdaten löschbar; Snapshot zeigt was Owner gesehen hat
- **Anti-Missbrauch**: Rate-Limit für Bewerbungen (max 20/Tag), Meldefunktion
- **Verifikations-Badges**: „E-Mail verifiziert", „Tresor verbunden" (zeigt Vertrauen ohne Daten preiszugeben)
- **Deutscher Rechts-Hinweis** auf Listing-Erstellen: Pflichtangaben nach EnEV/GEG (Energieausweis), Provisionsfrei bei Vermietung (§ 2 WoVermRG)

---

## Technische Details (für Devs)

**Migration** legt 5 neue Tabellen + 3 Enums (`listing_kind`, `listing_status`, `application_status`) + 2 SECURITY DEFINER Functions an:
- `publish_listing(_property_id, _unit_id, _payload jsonb)` → returns listing_id, validiert Eigentum
- `can_view_seeker_profile(_seeker uuid, _viewer uuid)` → boolean, prüft ob Application existiert
- Trigger: bei `applications` INSERT → `listings.applications_count++`; bei Listing-View RPC → `views_count++`

**Frontend-Struktur:**
```text
src/pages/
├── Markt.tsx              ← öffentliche Suche (Karte+Liste)
├── MarktDetail.tsx        ← öffentliches Listing
└── app/
    ├── Listings.tsx                ← meine Inserate (Owner)
    ├── ListingEditor.tsx           ← Wizard Erstellen/Bearbeiten
    ├── ListingApplications.tsx     ← Bewerber-Inbox pro Listing
    ├── SeekerProfile.tsx           ← mein Bewerber-Profil
    ├── MyApplications.tsx          ← meine Bewerbungen + Chats
    └── SeekerAlerts.tsx            ← Suchaufträge

src/components/market/
├── ListingCard.tsx
├── ListingMap.tsx                  ← reuse mapbox aus Marketplace
├── ApplicationRow.tsx
└── ApplyDialog.tsx
```

**Routing:** `/markt` und `/markt/:id` öffentlich (kein ProtectedRoute). „Bewerben" prüft Auth, ggf. Redirect → `/auth?redirect=/markt/:id`.

**Sidebar:** neue Gruppe „Markt" mit „Inserate", „Bewerber-Profil", „Meine Bewerbungen", „Suchaufträge".

**Dashboard-Hero:** zweiter CTA-Banner „Leerstand? In 60 Sek. veröffentlichen" wenn Units ohne aktiven Mietvertrag existieren.

---

## Phase 2 (später, nicht jetzt)

- Bezahlte Premium-Listings (Stripe), Top-Platzierung
- Verifizierter SCHUFA-Upload mit AI-Auslesung (Lovable AI)
- Besichtigungs-Slot-Buchung mit Kalender
- Auto-Mietvertrag-Generator bei Annahme (PDF aus Vorlage)
- Käufer-Angebote mit Bietverfahren (Sale-Listings)
- B2B: Makler-Accounts mit Bulk-Import

---

## Was passiert nach Approval

1. Migration mit allen Tabellen, Enums, RLS, Functions, Storage-Bucket
2. Bewerber-Profil + Owner-Listing-Wizard (kürzester Pfad zu Live)
3. Öffentliche `/markt` Seite mit Filter + Karte
4. Bewerbungs-Flow End-to-End (Apply → Inbox → Annehmen → wird Mieter)
5. Chat zwischen Owner & Seeker (Realtime)
6. Suchaufträge + Wishlist
7. Dashboard-Integration + Sidebar-Update + Rechts-Hinweise
