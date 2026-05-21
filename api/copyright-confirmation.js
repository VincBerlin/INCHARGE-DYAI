const crypto = require('crypto');

const DEFAULT_TERMS_VERSION = 'copyright-rights-v1.0';
const FALLBACK_CONFIRMATION_TEXT = 'Ich bestätige, dass ich alle erforderlichen Rechte, Lizenzen und Nutzungsfreigaben an den bereitgestellten Inhalten, insbesondere Texten, Bildern, Logos, Marken, Videos, Designs und sonstigen Materialien, besitze oder rechtmäßig zur Nutzung berechtigt bin. Ich bestätige außerdem, dass durch die Verwendung dieser Inhalte auf der Website keine Rechte Dritter verletzt werden. Ich stelle den Anbieter von sämtlichen Ansprüchen Dritter frei, die aus einer unrechtmäßigen Bereitstellung oder Nutzung der von mir gelieferten Inhalte entstehen.';

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.length > 0) {
    return realIp.trim();
  }

  return req.socket?.remoteAddress || 'unknown';
}

async function sendWebhook(record) {
  const webhookUrl = process.env.CONFIRMATION_WEBHOOK_URL;
  if (!webhookUrl) return { skipped: true };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Confirmation webhook failed with ${response.status}: ${body}`);
  }

  return { skipped: false, status: response.status };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    let body = req.body || {};
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    if (body.confirmed !== true) {
      return res.status(400).json({ error: 'Rights confirmation is required' });
    }

    const confirmationText = String(body.confirmationText || FALLBACK_CONFIRMATION_TEXT).trim();
    const ip = getClientIp(req);
    const now = new Date().toISOString();

    const record = {
      event: 'copyright_rights_confirmation',
      projectName: body.projectName || 'INCHARGE EMS Studio Website',
      confirmed: true,
      acceptedAt: now,
      ipHash: process.env.IP_HASH_SECRET ? sha256(`${ip}:${process.env.IP_HASH_SECRET}`) : null,
      userAgent: req.headers['user-agent'] || 'unknown',
      termsVersion: body.termsVersion || DEFAULT_TERMS_VERSION,
      acceptedTextHash: sha256(confirmationText),
      acceptedText: confirmationText,
      pageUrl: body.pageUrl || null,
      source: 'vercel_serverless_function',
    };

    console.log('Copyright rights confirmation:', JSON.stringify(record));

    await sendWebhook(record);

    return res.status(200).json({
      success: true,
      acceptedAt: record.acceptedAt,
      termsVersion: record.termsVersion,
      acceptedTextHash: record.acceptedTextHash,
    });
  } catch (error) {
    console.error('Copyright confirmation error:', error);
    return res.status(500).json({ error: 'Could not store rights confirmation' });
  }
};
