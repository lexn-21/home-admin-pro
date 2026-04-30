/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_URL = 'https://immoniq.xyz'

interface Props {
  status?: 'shortlisted' | 'rejected' | 'invited'
  listingTitle?: string
  applicantName?: string
  message?: string
}

const labels: Record<string, { emoji: string; head: string; body: string }> = {
  shortlisted: { emoji: '⭐', head: 'Du bist in der engeren Auswahl!', body: 'Der Vermieter hat dich vorgemerkt — die Chance steht gut.' },
  invited:     { emoji: '🤝', head: 'Einladung zur Besichtigung', body: 'Du wurdest zur Besichtigung eingeladen.' },
  rejected:    { emoji: '🙏', head: 'Diesmal hat\'s leider nicht geklappt', body: 'Der Vermieter hat sich anders entschieden. Kopf hoch — die nächste passt!' },
}

const ApplicationStatusEmail = ({ status = 'shortlisted', listingTitle, applicantName, message }: Props) => {
  const l = labels[status] ?? labels.shortlisted
  return (
    <Html lang="de" dir="ltr">
      <Head />
      <Preview>{l.head}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{l.emoji} {l.head}</Heading>
          <Text style={text}>
            {applicantName ? `Hallo ${applicantName},` : 'Hallo,'}
          </Text>
          <Text style={text}>
            {l.body} {listingTitle && <>(<strong>{listingTitle}</strong>)</>}
          </Text>
          {message && <Text style={quote}>"{message}"</Text>}
          <Button style={button} href={`${SITE_URL}/app/applications`}>
            Status ansehen
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: ApplicationStatusEmail,
  subject: (d: any) => labels[d.status ?? 'shortlisted']?.head ?? 'Update zu deiner Bewerbung',
  displayName: 'Bewerbung Status-Update',
  previewData: { status: 'shortlisted', listingTitle: '3-Zi Berlin', applicantName: 'Anna' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', fontWeight: 'bold' as const, color: '#0a0a0a', margin: '0 0 18px' }
const text = { fontSize: '15px', color: '#444', lineHeight: '1.6', margin: '0 0 16px' }
const quote = { fontSize: '15px', color: '#222', lineHeight: '1.6', margin: '0 0 24px', padding: '12px 16px', background: '#faf6e8', borderLeft: '3px solid #c9a227', borderRadius: '4px' }
const button = { backgroundColor: '#c9a227', color: '#0a0a0a', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '10px', padding: '13px 22px', textDecoration: 'none' }
