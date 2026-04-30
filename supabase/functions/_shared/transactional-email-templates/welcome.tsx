/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'ImmoNIQ'
const SITE_URL = 'https://immoniq.xyz'

interface WelcomeProps {
  name?: string
}

const WelcomeEmail = ({ name }: WelcomeProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Willkommen bei {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {name ? `Willkommen, ${name}!` : 'Willkommen bei ImmoNIQ!'}
        </Heading>
        <Text style={text}>
          Schön, dass du dabei bist. Du hast jetzt 30 Tage kostenlos vollen
          Zugriff auf alle Tools – Mietverwaltung, AfA-Rechner, Markt, Werbung & mehr.
        </Text>
        <Button style={button} href={`${SITE_URL}/app`}>Zum Dashboard</Button>
        <Text style={footer}>Bei Fragen einfach auf diese Mail antworten.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: 'Willkommen bei ImmoNIQ',
  displayName: 'Willkommen',
  previewData: { name: 'Leon' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0a0a0a', margin: '0 0 18px' }
const text = { fontSize: '15px', color: '#444', lineHeight: '1.6', margin: '0 0 24px' }
const button = {
  backgroundColor: '#c9a227',
  color: '#0a0a0a',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '10px',
  padding: '13px 22px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999', margin: '32px 0 0' }
