/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_URL = 'https://immoniq.xyz'

interface Props { adTitle?: string; reason?: string }

const AdRejectedEmail = ({ adTitle, reason }: Props) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Werbung "{adTitle}" abgelehnt</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Werbung nicht freigegeben</Heading>
        <Text style={text}>
          Deine Anzeige <strong>{adTitle ?? ''}</strong> konnten wir leider nicht freigeben.
        </Text>
        {reason && <Text style={quote}>{reason}</Text>}
        <Text style={text}>
          Du kannst die Anzeige direkt anpassen und erneut zur Prüfung einreichen.
        </Text>
        <Button style={button} href={`${SITE_URL}/app/ads`}>Anzeige bearbeiten</Button>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdRejectedEmail,
  subject: (d: any) => `Werbung abgelehnt: ${d.adTitle ?? ''}`.trim(),
  displayName: 'Werbung abgelehnt',
  previewData: { adTitle: 'Frühlings-Sale', reason: 'Bild ist zu klein, bitte mind. 1200×630.' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0a0a0a', margin: '0 0 18px' }
const text = { fontSize: '15px', color: '#444', lineHeight: '1.6', margin: '0 0 16px' }
const quote = { fontSize: '14px', color: '#a04040', lineHeight: '1.6', margin: '0 0 20px', padding: '12px 16px', background: '#fdf2f2', borderLeft: '3px solid #d04040', borderRadius: '4px' }
const button = { backgroundColor: '#c9a227', color: '#0a0a0a', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '10px', padding: '13px 22px', textDecoration: 'none' }
