/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_URL = 'https://immoniq.xyz'

interface Props { adTitle?: string }

const AdApprovedEmail = ({ adTitle }: Props) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Deine Werbung "{adTitle}" ist live</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>✅ Werbung freigegeben</Heading>
        <Text style={text}>
          Deine Anzeige <strong>{adTitle ?? 'auf ImmoNIQ'}</strong> wurde geprüft und ist ab sofort live.
        </Text>
        <Text style={text}>
          Reichweite, Klicks und CTR siehst du in Echtzeit in deinem Dashboard.
        </Text>
        <Button style={button} href={`${SITE_URL}/app/ads`}>Stats ansehen</Button>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdApprovedEmail,
  subject: (d: any) => `✅ Werbung freigegeben: ${d.adTitle ?? ''}`.trim(),
  displayName: 'Werbung freigegeben',
  previewData: { adTitle: 'Frühlings-Sale' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0a0a0a', margin: '0 0 18px' }
const text = { fontSize: '15px', color: '#444', lineHeight: '1.6', margin: '0 0 16px' }
const button = { backgroundColor: '#c9a227', color: '#0a0a0a', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '10px', padding: '13px 22px', textDecoration: 'none' }
