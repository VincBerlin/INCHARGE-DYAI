# Copyright-/Rechtebestätigung für Vercel

Diese Website enthält jetzt eine verpflichtende Copyright- und Rechtebestätigung.
Der Besucher/Kunde muss aktiv bestätigen, bevor die Website geöffnet wird.

## Eingebaute Dateien

- `index.html` enthält Modal, Styling und Frontend-Logik.
- `api/copyright-confirmation.js` ist der Vercel Serverless Function Endpoint.
- `.env.example` zeigt die benötigten Environment Variables.

## Was gespeichert beziehungsweise erzeugt wird

Beim Klick auf „Bestätigen und Website öffnen“ sendet das Frontend einen POST Request an:

```txt
/api/copyright-confirmation
```

Der Vercel Endpoint erzeugt einen Nachweisdatensatz mit:

- Projektname
- Bestätigungsstatus
- Datum/Uhrzeit
- IP-Hash, nicht rohe IP
- User-Agent
- Text-Version
- Hash des bestätigten Rechtetextes
- bestätigter Rechtetext
- Seiten-URL

## Vercel Environment Variables

In Vercel setzen:

```env
IP_HASH_SECRET=ein-langer-geheimer-random-string
CONFIRMATION_WEBHOOK_URL=https://dein-webhook-endpunkt.example.com
```

`IP_HASH_SECRET` ist Pflicht.

`CONFIRMATION_WEBHOOK_URL` ist optional, aber für dauerhafte Nachweisführung empfohlen.
Ohne Webhook steht der Datensatz nur in den Vercel Function Logs.

## Vercel Schritte

1. Projekt in Vercel öffnen.
2. `Settings` öffnen.
3. `Environment Variables` öffnen.
4. `IP_HASH_SECRET` als Production Variable hinzufügen.
5. Optional `CONFIRMATION_WEBHOOK_URL` hinzufügen.
6. Neues Deployment auslösen.

## Webhook Payload

Wenn `CONFIRMATION_WEBHOOK_URL` gesetzt ist, wird ein JSON Payload gesendet:

```json
{
  "event": "copyright_rights_confirmation",
  "projectName": "INCHARGE EMS Studio Website",
  "confirmed": true,
  "acceptedAt": "2026-05-21T00:00:00.000Z",
  "ipHash": "...",
  "userAgent": "...",
  "termsVersion": "copyright-rights-v1.0",
  "acceptedTextHash": "...",
  "acceptedText": "...",
  "pageUrl": "...",
  "source": "vercel_serverless_function"
}
```

## Rechtlicher Hinweis

Diese technische Lösung dokumentiert die aktive Bestätigung. Sie ersetzt keine anwaltliche Prüfung von Vertragsklauseln, Datenschutzerklärung, AGB oder Haftungsfreistellung.
