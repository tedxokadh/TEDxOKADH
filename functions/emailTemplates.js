const LOGO_URL = 'https://www.tedxokadh.co/logo1.png'
const SITE_URL = 'https://www.tedxokadh.co'

const CSS = `
<style>
@media (prefers-color-scheme: light) {
  .em-bg   { background:#f0f0f0 !important; }
  .em-card { background:#ffffff !important; border-color:#e0e0e0 !important; }
  .em-strip{ background:linear-gradient(90deg,rgba(230,43,30,0.1) 0%,rgba(230,43,30,0.03) 60%,transparent 100%) !important; border-bottom-color:#e8e8e8 !important; }
  .em-hi   { color:#111111 !important; }
  .em-mid  { color:#333333 !important; }
  .em-lo   { color:#555555 !important; }
  .em-dim  { color:#777777 !important; }
  .em-div  { background:linear-gradient(90deg,#e0e0e0,rgba(230,43,30,0.3),#e0e0e0) !important; }
  .em-fl   { color:#888888 !important; }
}
</style>`

function docHead(title) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
${CSS}
</head>
<body class="em-bg" style="margin:0;padding:0;background:#080808;">`
}

function logoRow() {
  return `
<tr>
  <td align="center" style="padding:40px 0 32px;">
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td valign="middle" style="padding-right:10px;">
          <img src="${LOGO_URL}" alt="" width="38" height="38"
            style="display:block;border-radius:4px;object-fit:contain;"
            onerror="this.style.display='none'"/>
        </td>
        <td valign="middle">
          <span style="font-size:22px;font-weight:900;letter-spacing:2px;color:#E62B1E;font-family:Arial,Helvetica,sans-serif;">TED</span><span style="font-size:13px;font-weight:900;color:#E62B1E;vertical-align:super;font-family:Arial,Helvetica,sans-serif;">x</span><span class="em-hi" style="font-size:22px;font-weight:900;letter-spacing:2px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">OKADH</span>
        </td>
      </tr>
    </table>
  </td>
</tr>`
}

function footerRow() {
  return `
<tr>
  <td style="padding:28px 0 0;text-align:center;">
    <p style="margin:0 0 6px;">
      <a href="${SITE_URL}" class="em-fl" style="color:#E62B1E;text-decoration:none;font-size:12px;font-family:Arial,Helvetica,sans-serif;">www.tedxokadh.co</a>
    </p>
    <p class="em-fl" style="margin:0;color:#333333;font-size:11px;font-family:Arial,Helvetica,sans-serif;">
      This independent TEDx event is operated under license from TED.
    </p>
  </td>
</tr>`
}

function confirmationEmail({ name, code }) {
  return `${docHead('Your TEDxOkadh Registration Confirmation')}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="em-bg" style="background:#080808;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

${logoRow()}

<tr>
  <td class="em-card" style="background:#0f0f0f;border:1px solid #1c1c1c;border-radius:14px;overflow:hidden;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td class="em-strip" style="background:linear-gradient(90deg,rgba(230,43,30,0.18) 0%,rgba(230,43,30,0.04) 60%,transparent 100%);padding:20px 32px;border-bottom:1px solid #1a1a1a;">
          <span style="color:#E62B1E;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">Registration Confirmed</span>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:36px 32px;">
          <p class="em-hi" style="margin:0 0 14px;color:#d0d0d0;font-size:15px;line-height:1.8;font-family:Arial,Helvetica,sans-serif;">
            Dear <strong>${name}</strong>,
          </p>
          <p class="em-mid" style="margin:0 0 14px;color:#d0d0d0;font-size:15px;line-height:1.8;font-family:Arial,Helvetica,sans-serif;">
            Thank you for registering for <strong>TEDxOkadh</strong>.
          </p>
          <p class="em-lo" style="margin:0 0 32px;color:#666666;font-size:14px;line-height:1.9;font-family:Arial,Helvetica,sans-serif;">
            We are excited to welcome you to an inspiring experience filled with ideas, conversations, and meaningful connections.
          </p>
          <div class="em-div" style="height:1px;background:linear-gradient(90deg,#1c1c1c,rgba(230,43,30,0.2),#1c1c1c);margin-bottom:32px;"></div>
          <p class="em-dim" style="margin:0 0 20px;color:#888888;font-size:13px;font-family:Arial,Helvetica,sans-serif;">Your personal QR code is:</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" class="em-card" style="background:#0f0f0f;border:1px solid #1c1c1c;border-radius:12px;padding:28px;">
                <div style="background:#ffffff;border-radius:8px;display:inline-block;padding:12px;line-height:0;">
                  <img src="cid:qrcode" alt="QR Code" width="180" height="180" style="display:block;border-radius:4px;"/>
                </div>
                <p style="margin:14px 0 0;color:#E62B1E;font-size:10px;font-weight:700;letter-spacing:3px;font-family:'Courier New',monospace;">${code}</p>
              </td>
            </tr>
          </table>
          <p class="em-lo" style="margin:24px 0 32px;color:#555555;font-size:13px;line-height:1.8;font-family:Arial,Helvetica,sans-serif;">
            Please keep this with you, as it may be required for event access or future updates.
          </p>
          <div class="em-div" style="height:1px;background:linear-gradient(90deg,#1c1c1c,rgba(230,43,30,0.2),#1c1c1c);margin-bottom:32px;"></div>
          <p class="em-lo" style="margin:0 0 6px;color:#666666;font-size:14px;line-height:1.8;font-family:Arial,Helvetica,sans-serif;">
            We look forward to seeing you at TEDxOkadh.
          </p>
          <p class="em-lo" style="margin:0 0 4px;color:#555555;font-size:14px;font-family:Arial,Helvetica,sans-serif;">Best regards,</p>
          <p class="em-hi" style="margin:0;color:#cccccc;font-size:14px;font-weight:700;font-family:Arial,Helvetica,sans-serif;">TEDxOkadh Team</p>
        </td>
      </tr>
    </table>
  </td>
</tr>

${footerRow()}

</table>
</td></tr>
</table>
</body>
</html>`
}

function reminderEmail({ name, confirmLink }) {
  return `${docHead('TEDxOkadh — 2 Days Away')}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="em-bg" style="background:#080808;padding:40px 16px;">
<tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

${logoRow()}

<tr>
  <td class="em-card" style="background:#0f0f0f;border:1px solid #1c1c1c;border-radius:14px;overflow:hidden;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td class="em-strip" style="background:linear-gradient(90deg,rgba(230,43,30,0.18) 0%,rgba(230,43,30,0.04) 60%,transparent 100%);padding:20px 32px;border-bottom:1px solid #1a1a1a;">
          <span style="color:#E62B1E;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">2 Days Away</span>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:36px 32px;">
          <p class="em-hi" style="margin:0 0 20px;color:#d0d0d0;font-size:15px;line-height:1.8;font-family:Arial,Helvetica,sans-serif;">
            Dear <strong>${name}</strong>,
          </p>
          <p class="em-lo" style="margin:0 0 32px;color:#666666;font-size:14px;line-height:1.9;font-family:Arial,Helvetica,sans-serif;">
            <strong class="em-hi" style="color:#d0d0d0;">TEDxOkadh is only two days away.</strong>
          </p>
          <div class="em-div" style="height:1px;background:linear-gradient(90deg,#1c1c1c,rgba(230,43,30,0.2),#1c1c1c);margin-bottom:32px;"></div>
          <p class="em-lo" style="margin:0 0 24px;color:#666666;font-size:14px;line-height:1.9;font-family:Arial,Helvetica,sans-serif;">
            To help us confirm attendance and prepare for your arrival, please use the button below if you are planning to attend:
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
            <tr>
              <td style="background:#E62B1E;border-radius:8px;">
                <a href="${confirmLink}" target="_blank"
                  style="display:inline-block;padding:14px 36px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:0.5px;font-family:Arial,Helvetica,sans-serif;">
                  Confirm Attendance &rarr;
                </a>
              </td>
            </tr>
          </table>
          <p class="em-dim" style="margin:0 0 4px;color:#444444;font-size:11px;font-family:Arial,Helvetica,sans-serif;">Or copy this link:</p>
          <p style="margin:0 0 32px;color:#555555;font-size:11px;word-break:break-all;font-family:'Courier New',monospace;">${confirmLink}</p>
          <div class="em-div" style="height:1px;background:linear-gradient(90deg,#1c1c1c,rgba(230,43,30,0.2),#1c1c1c);margin-bottom:32px;"></div>
          <p class="em-lo" style="margin:0 0 28px;color:#555555;font-size:13px;line-height:1.8;font-family:Arial,Helvetica,sans-serif;">
            Your response will help us organize the check-in process and ensure a smooth event experience.
          </p>
          <p class="em-lo" style="margin:0 0 6px;color:#666666;font-size:14px;font-family:Arial,Helvetica,sans-serif;">We look forward to welcoming you soon.</p>
          <p class="em-lo" style="margin:0 0 4px;color:#555555;font-size:14px;font-family:Arial,Helvetica,sans-serif;">Best regards,</p>
          <p class="em-hi" style="margin:0;color:#cccccc;font-size:14px;font-weight:700;font-family:Arial,Helvetica,sans-serif;">TEDxOkadh Team</p>
        </td>
      </tr>
    </table>
  </td>
</tr>

${footerRow()}

</table>
</td></tr>
</table>
</body>
</html>`
}

module.exports = { confirmationEmail, reminderEmail }


