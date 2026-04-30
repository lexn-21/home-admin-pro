/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Text, Hr, Section } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  customerName?: string
  description?: string
  amountFormatted?: string
  invoiceNumber?: string
  invoiceDate?: string
  invoicePdfUrl?: string
  hostedInvoiceUrl?: string
}

const InvoiceEmail = ({
  customerName,
  description = 'ImmoNIQ',
  amountFormatted,
  invoiceNumber,
  invoiceDate,
  invoicePdfUrl,
  hostedInvoiceUrl,
}: Props) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Deine Rechnung von ImmoNIQ {invoiceNumber ? `· ${invoiceNumber}` : ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🧾 Deine Rechnung</Heading>
        <Text style={text}>
          {customerName ? `Hallo ${customerName},` : 'Hallo,'}
        </Text>
        <Text style={text}>
          danke für deinen Einkauf bei ImmoNIQ. Hier deine GoBD-konforme Rechnung — direkt für deine Buchhaltung.
        </Text>

        <Section style={box}>
          <Text style={kv}><strong>Leistung:</strong> {description}</Text>
          {amountFormatted && <Text style={kv}><strong>Betrag:</strong> {amountFormatted}</Text>}
          {invoiceNumber && <Text style={kv}><strong>Rechnungs-Nr.:</strong> {invoiceNumber}</Text>}
          {invoiceDate && <Text style={kv}><strong>Datum:</strong> {invoiceDate}</Text>}
        </Section>

        {invoicePdfUrl && (
          <Button style={button} href={invoicePdfUrl}>📄 Rechnung als PDF</Button>
        )}
        {hostedInvoiceUrl && (
          <Text style={small}>
            Online ansehen: <a href={hostedInvoiceUrl} style={link}>{hostedInvoiceUrl}</a>
          </Text>
        )}

        <Hr style={hr} />
        <Text style={tip}>
          💡 <strong>Tipp:</strong> Im App-Bereich „Steuer-Brücke" findest du alle Rechnungen + ELSTER-Export für deinen Steuerberater.
        </Text>
        <Text style={footer}>
          Aufbewahrungspflicht: 10 Jahre nach § 147 AO. Deine Rechnungen liegen sicher in deinem ImmoNIQ-Tresor.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: InvoiceEmail,
  subject: (d: any) => `🧾 Rechnung ${d.invoiceNumber ?? ''} · ImmoNIQ`.trim(),
  displayName: 'Rechnung',
  previewData: {
    customerName: 'Leon',
    description: 'ImmoNIQ Pro · 1 Monat',
    amountFormatted: '9,90 € (inkl. 19 % USt)',
    invoiceNumber: 'INV-2026-0001',
    invoiceDate: '30.04.2026',
    invoicePdfUrl: 'https://example.com/invoice.pdf',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0a0a0a', margin: '0 0 18px' }
const text = { fontSize: '15px', color: '#444', lineHeight: '1.6', margin: '0 0 14px' }
const box = { background: '#faf6e8', border: '1px solid #ead38a', borderRadius: '10px', padding: '16px 18px', margin: '14px 0 22px' }
const kv = { fontSize: '14px', color: '#333', margin: '4px 0', lineHeight: '1.5' }
const button = { backgroundColor: '#c9a227', color: '#0a0a0a', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '10px', padding: '13px 22px', textDecoration: 'none' }
const small = { fontSize: '12px', color: '#888', margin: '12px 0 0' }
const link = { color: '#c9a227' }
const hr = { borderColor: '#eee', margin: '28px 0 18px' }
const tip = { fontSize: '13px', color: '#666', lineHeight: '1.6', margin: '0 0 12px' }
const footer = { fontSize: '11px', color: '#999', margin: '12px 0 0', lineHeight: '1.5' }
