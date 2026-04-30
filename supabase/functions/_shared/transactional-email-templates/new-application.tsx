/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Text, Hr } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_URL = 'https://immoniq.xyz'

interface Props {
  listingTitle?: string
  applicantName?: string
  coverMessage?: string
  applicationId?: string
}

const NewApplicationEmail = ({ listingTitle, applicantName, coverMessage, applicationId }: Props) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Neue Bewerbung für {listingTitle ?? 'dein Inserat'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎉 Neue Bewerbung eingegangen</Heading>
        <Text style={text}>
          {applicantName ? <><strong>{applicantName}</strong> hat sich </> : 'Ein Interessent hat sich '}
          auf dein Inserat <strong>{listingTitle ?? 'beworben'}</strong> beworben.
        </Text>
        {coverMessage && (
          <>
            <Text style={label}>Nachricht:</Text>
            <Text style={quote}>"{coverMessage}"</Text>
          </>
        )}
        <Button style={button} href={`${SITE_URL}/app/listings/${applicationId ?? ''}/applications`}>
          Bewerbung ansehen
        </Button>
        <Hr style={hr} />
        <Text style={tip}>
          💡 <strong>Tipp:</strong> Antworte innerhalb 24 h — Bewerber, die schnell Antwort bekommen, vermieten 3× häufiger.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NewApplicationEmail,
  subject: (d: any) => `Neue Bewerbung: ${d.listingTitle ?? 'dein Inserat'}`,
  displayName: 'Neue Bewerbung',
  previewData: { listingTitle: '3-Zi-Wohnung Berlin Mitte', applicantName: 'Anna Müller', coverMessage: 'Hallo, wir würden uns sehr freuen…' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0a0a0a', margin: '0 0 18px' }
const text = { fontSize: '15px', color: '#444', lineHeight: '1.6', margin: '0 0 16px' }
const label = { fontSize: '13px', color: '#888', margin: '16px 0 4px', textTransform: 'uppercase' as const, letterSpacing: '0.5px' }
const quote = { fontSize: '15px', color: '#222', lineHeight: '1.6', margin: '0 0 24px', padding: '12px 16px', background: '#faf6e8', borderLeft: '3px solid #c9a227', borderRadius: '4px' }
const button = { backgroundColor: '#c9a227', color: '#0a0a0a', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '10px', padding: '13px 22px', textDecoration: 'none' }
const hr = { borderColor: '#eee', margin: '28px 0 18px' }
const tip = { fontSize: '13px', color: '#666', lineHeight: '1.6', margin: 0 }
