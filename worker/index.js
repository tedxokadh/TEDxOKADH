const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// ─── Email Templates ──────────────────────────────────────────

function confirmationHTML({ name, code, qrBase64, siteUrl }) {
  const logoUrl = `${siteUrl}/logo1.png`
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#080808;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

  <!-- Logo -->
  <tr><td align="center" style="padding:40px 0 32px;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td valign="middle" style="padding-right:10px;">
        <img src="${logoUrl}" alt="" width="36" height="36" style="display:block;object-fit:contain;" onerror="this.style.display='none'"/>
      </td>
      <td valign="middle">
        <span style="font-size:22px;font-weight:900;letter-spacing:2px;color:#E62B1E;font-family:Arial,sans-serif;">TED</span><span style="font-size:13px;font-weight:900;color:#E62B1E;vertical-align:super;font-family:Arial,sans-serif;">x</span><span style="font-size:22px;font-weight:900;letter-spacing:2px;color:#fff;font-family:Arial,sans-serif;">OKADH</span>
      </td>
    </tr></table>
  </td></tr>

  <!-- Card -->
  <tr><td style="background:#0f0f0f;border:1px solid #1c1c1c;border-radius:14px;overflow:hidden;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:linear-gradient(90deg,rgba(230,43,30,0.18) 0%,rgba(230,43,30,0.04) 60%,transparent 100%);padding:20px 32px;border-bottom:1px solid #1a1a1a;">
        <span style="color:#E62B1E;font-size:11px;font-weight:700;letter-spacing:3px;font-family:Arial,sans-serif;">REGISTRATION CONFIRMED</span>
      </td></tr>
      <tr><td style="padding:36px 32px;">
        <p style="margin:0 0 14px;color:#d0d0d0;font-size:15px;line-height:1.8;font-family:Arial,sans-serif;">Thank you for registering for <strong style="color:#fff;">TEDxOkadh</strong>.</p>
        <p style="margin:0 0 32px;color:#666;font-size:14px;line-height:1.9;font-family:Arial,sans-serif;">We are excited to welcome you to an inspiring experience filled with ideas, conversations, and meaningful connections.</p>
        <div style="height:1px;background:linear-gradient(90deg,#1c1c1c,rgba(230,43,30,0.2),#1c1c1c);margin-bottom:32px;"></div>
        <p style="margin:0 0 20px;color:#888;font-size:13px;font-family:Arial,sans-serif;">Your personal QR code is:</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td align="center" style="background:#080808;border:1px solid #1c1c1c;border-radius:12px;padding:28px;">
            <img src="${qrBase64}" alt="QR Code" width="190" height="190" style="display:block;border-radius:10px;"/>
            <p style="margin:14px 0 0;color:#E62B1E;font-size:10px;font-weight:700;letter-spacing:3px;font-family:'Courier New',monospace;">${code}</p>
          </td></tr>
        </table>
        <p style="margin:24px 0 32px;color:#555;font-size:13px;line-height:1.8;font-family:Arial,sans-serif;">Please keep this with you, as it may be required for event access or future updates.</p>
        <div style="height:1px;background:linear-gradient(90deg,#1c1c1c,rgba(230,43,30,0.2),#1c1c1c);margin-bottom:32px;"></div>
        <p style="margin:0 0 6px;color:#666;font-size:14px;line-height:1.8;font-family:Arial,sans-serif;">We look forward to seeing you at TEDxOkadh.</p>
        <p style="margin:0 0 4px;color:#555;font-size:14px;font-family:Arial,sans-serif;">Best regards,</p>
        <p style="margin:0;color:#ccc;font-size:14px;font-weight:700;font-family:Arial,sans-serif;">TEDxOkadh Team</p>
      </td></tr>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:28px 0 0;text-align:center;">
    <p style="margin:0 0 6px;font-size:12px;font-family:Arial,sans-serif;"><a href="${siteUrl}" style="color:#E62B1E;text-decoration:none;">www.tedxokadh.co</a></p>
    <p style="margin:0;color:#222;font-size:11px;font-family:Arial,sans-serif;">This independent TEDx event is operated under license from TED.</p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`
}

function reminderHTML({ name, confirmLink, siteUrl }) {
  const logoUrl = `${siteUrl}/logo1.png`
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#080808;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

  <!-- Logo -->
  <tr><td align="center" style="padding:40px 0 32px;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td valign="middle" style="padding-right:10px;">
        <img src="${logoUrl}" alt="" width="36" height="36" style="display:block;object-fit:contain;" onerror="this.style.display='none'"/>
      </td>
      <td valign="middle">
        <span style="font-size:22px;font-weight:900;letter-spacing:2px;color:#E62B1E;font-family:Arial,sans-serif;">TED</span><span style="font-size:13px;font-weight:900;color:#E62B1E;vertical-align:super;font-family:Arial,sans-serif;">x</span><span style="font-size:22px;font-weight:900;letter-spacing:2px;color:#fff;font-family:Arial,sans-serif;">OKADH</span>
      </td>
    </tr></table>
  </td></tr>

  <!-- Card -->
  <tr><td style="background:#0f0f0f;border:1px solid #1c1c1c;border-radius:14px;overflow:hidden;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:linear-gradient(90deg,rgba(230,43,30,0.18) 0%,rgba(230,43,30,0.04) 60%,transparent 100%);padding:20px 32px;border-bottom:1px solid #1a1a1a;">
        <span style="color:#E62B1E;font-size:11px;font-weight:700;letter-spacing:3px;font-family:Arial,sans-serif;">2 DAYS AWAY</span>
      </td></tr>
      <tr><td style="padding:36px 32px;">
        <p style="margin:0 0 20px;color:#d0d0d0;font-size:15px;line-height:1.8;font-family:Arial,sans-serif;">Dear <strong style="color:#fff;">${name}</strong>,</p>
        <p style="margin:0 0 32px;color:#666;font-size:14px;line-height:1.9;font-family:Arial,sans-serif;"><strong style="color:#d0d0d0;">TEDxOkadh is only two days away.</strong></p>
        <div style="height:1px;background:linear-gradient(90deg,#1c1c1c,rgba(230,43,30,0.2),#1c1c1c);margin-bottom:32px;"></div>
        <p style="margin:0 0 24px;color:#666;font-size:14px;line-height:1.9;font-family:Arial,sans-serif;">To help us confirm attendance and prepare for your arrival, please use the button below if you are planning to attend:</p>
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
          <tr><td style="background:#E62B1E;border-radius:8px;">
            <a href="${confirmLink}" target="_blank" style="display:inline-block;padding:14px 36px;color:#fff;text-decoration:none;font-size:14px;font-weight:700;font-family:Arial,sans-serif;">Confirm Attendance &rarr;</a>
          </td></tr>
        </table>
        <p style="margin:0 0 4px;color:#333;font-size:11px;font-family:Arial,sans-serif;">Or copy this link:</p>
        <p style="margin:0 0 32px;color:#3a3a3a;font-size:11px;word-break:break-all;font-family:'Courier New',monospace;">${confirmLink}</p>
        <div style="height:1px;background:linear-gradient(90deg,#1c1c1c,rgba(230,43,30,0.2),#1c1c1c);margin-bottom:32px;"></div>
        <p style="margin:0 0 28px;color:#555;font-size:13px;line-height:1.8;font-family:Arial,sans-serif;">Your response will help us organize the check-in process and ensure a smooth event experience.</p>
        <p style="margin:0 0 6px;color:#666;font-size:14px;font-family:Arial,sans-serif;">We look forward to welcoming you soon.</p>
        <p style="margin:0 0 4px;color:#555;font-size:14px;font-family:Arial,sans-serif;">Best regards,</p>
        <p style="margin:0;color:#ccc;font-size:14px;font-weight:700;font-family:Arial,sans-serif;">TEDxOkadh Team</p>
      </td></tr>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:28px 0 0;text-align:center;">
    <p style="margin:0 0 6px;font-size:12px;font-family:Arial,sans-serif;"><a href="${siteUrl}" style="color:#E62B1E;text-decoration:none;">www.tedxokadh.co</a></p>
    <p style="margin:0;color:#222;font-size:11px;font-family:Arial,sans-serif;">This independent TEDx event is operated under license from TED.</p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`
}

// ─── Worker Handler ───────────────────────────────────────────

export default {
  async fetch(request, env) {
    const cors = CORS

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: cors })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const { type, name, email, code, qrBase64 } = body

    if (!type || !email) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    let subject, html

    if (type === 'confirmation') {
      if (!name || !code) {
        return new Response(JSON.stringify({ error: 'Missing name or code' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        })
      }
      subject = 'Your TEDxOkadh Registration Confirmation'
      html = confirmationHTML({ name, code, qrBase64: qrBase64 || '', siteUrl: env.SITE_URL })

    } else if (type === 'reminder') {
      const confirmLink = `${env.SITE_URL}/confirm/${encodeURIComponent(code)}`
      subject = 'TEDxOkadh — 2 Days Away'
      html = reminderHTML({ name, confirmLink, siteUrl: env.SITE_URL })

    } else {
      return new Response(JSON.stringify({ error: 'Unknown type' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: env.FROM_EMAIL, to: email, subject, html }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Resend error:', JSON.stringify(data))
      return new Response(JSON.stringify({ error: data }), {
        status: 502, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  },
}
