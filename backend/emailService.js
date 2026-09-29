const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

let cachedTransporter = null;
const receiptsCache = new Map();

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  // 1. Direct Gmail Configuration (e.g. GMAIL_USER & GMAIL_PASS app password)
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    console.log('[EmailService] Using direct Gmail SMTP service with user:', process.env.GMAIL_USER);
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // 16-character app password
      },
    });
    return cachedTransporter;
  }

  // 2. Custom Standard SMTP Configuration
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('[EmailService] Using custom SMTP service:', process.env.SMTP_HOST);
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return cachedTransporter;
  }

  // 3. Ethereal Test Account (Sandbox mode for instant local testing with preview links)
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('[EmailService] Running in sandbox mode. Test account:', testAccount.user);
    return cachedTransporter;
  } catch (err) {
    console.warn('[EmailService] Falling back to JSON transporter:', err.message);
    cachedTransporter = nodemailer.createTransport({
      jsonTransport: true
    });
    return cachedTransporter;
  }
}

function getReceiptHtml(txnId) {
  return receiptsCache.get(txnId) || null;
}

function buildReceiptHtml({ recipientEmail, trip, paymentMethod, split, transactionId, totalAmount }) {
  const formattedTotal = Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const paymentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const categoryIcons = {
    'Accommodation': '🏨',
    'Food': '🍽️',
    'Transport': '🚗',
    'Activities': '🎟️',
    'Shopping': '🛍️',
    'Other': '🌐'
  };

  const tableRows = (split || []).map(item => `
    <tr style="border-bottom: 1px solid #1e293b;">
      <td style="padding: 12px 14px; font-weight: 600; color: #f1f5f9;">
        ${categoryIcons[item.category] || '📌'} ${item.category}
      </td>
      <td style="padding: 12px 14px; text-align: center; color: #38bdf8; font-weight: 600;">
        ${item.percent}%
      </td>
      <td style="padding: 12px 14px; text-align: right; font-weight: 700; color: #10b981;">
        ₹${Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>TripMate Booking & Payment Receipt</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        @media print {
          body { background: #fff !important; color: #000 !important; }
          .no-print { display: none !important; }
          .receipt-container { box-shadow: none !important; border: 1px solid #ccc !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0b1120; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
      <div class="receipt-container" style="max-width: 620px; margin: 30px auto; background: #0f172a; border: 1px solid #334155; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #0f172a 100%); padding: 32px 28px; text-align: center;">
          <div style="display: inline-block; background: rgba(255,255,255,0.15); border-radius: 9999px; padding: 6px 14px; margin-bottom: 12px;">
            <span style="color: #fff; font-size: 13px; font-weight: 700; letter-spacing: 0.5px;">✈️ TRIPMATE PAYMENT CONFIRMATION</span>
          </div>
          <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800;">Payment Successful</h1>
          <p style="margin: 8px 0 0 0; color: #bae6fd; font-size: 15px;">Your travel budget has been paid & automatically split</p>
        </div>

        <div style="padding: 28px;">
          <!-- Trip Overview Card -->
          <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid #334155; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
            <div style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Trip Destination</div>
            <div style="font-size: 20px; font-weight: 800; color: #38bdf8; margin-top: 4px;">${trip.destination}${trip.country ? `, ${trip.country}` : ''}</div>
            
            <div style="display: flex; justify-content: space-between; margin-top: 14px; padding-top: 12px; border-top: 1px dashed #334155; font-size: 13px;">
              <div><span style="color: #94a3b8;">Trip Title:</span> <strong style="color: #f8fafc;">${trip.title || trip.trip_title || 'Adventure'}</strong></div>
              <div><span style="color: #94a3b8;">Trip Type:</span> <strong style="color: #f8fafc;">${trip.trip_type || 'Custom'}</strong></div>
            </div>
          </div>

          <!-- Transaction Summary Box -->
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
            <div style="font-size: 13px; color: #a7f3d0; font-weight: 600;">Total Amount Paid</div>
            <div style="font-size: 32px; font-weight: 900; color: #34d399; margin: 4px 0;">₹${formattedTotal}</div>
            <div style="font-size: 12px; color: #cbd5e1;">
              Method: <strong>${paymentMethod}</strong> • TXN ID: <code style="background: #1e293b; padding: 2px 6px; border-radius: 4px; color: #38bdf8;">${transactionId}</code>
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">Paid on ${paymentDate}</div>
          </div>

          <!-- Itemized Category Split Breakdown -->
          <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #f8fafc;">
              📊 Itemized Expenses by Category Breakdown
            </h3>
            <p style="margin: 0 0 14px 0; font-size: 12.5px; color: #94a3b8;">
              Your ₹${formattedTotal} budget has been divided into the standard 6 travel expense buckets:
            </p>

            <table style="width: 100%; border-collapse: collapse; background: #0b1120; border: 1px solid #1e293b; border-radius: 10px; overflow: hidden; font-size: 13.5px;">
              <thead>
                <tr style="background: #1e293b; color: #94a3b8; text-align: left; font-size: 12px; text-transform: uppercase;">
                  <th style="padding: 10px 14px;">Expense Category</th>
                  <th style="padding: 10px 14px; text-align: center;">Share (%)</th>
                  <th style="padding: 10px 14px; text-align: right;">Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
                <tr style="background: #1e293b; font-weight: 800; color: #f8fafc;">
                  <td style="padding: 14px;">Total Budget Allocation</td>
                  <td style="padding: 14px; text-align: center; color: #38bdf8;">100%</td>
                  <td style="padding: 14px; text-align: right; color: #34d399; font-size: 15px;">₹${formattedTotal}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Actions: Print / PDF -->
          <div class="no-print" style="text-align: center; margin-bottom: 20px;">
            <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 10px 20px; font-size: 14px; font-weight: 700; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">
              🖨️ Print / Save as PDF
            </button>
          </div>

          <!-- Important Note -->
          <div style="background: rgba(14, 165, 233, 0.08); border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 4px; font-size: 12.5px; color: #94a3b8; margin-bottom: 24px;">
            <strong style="color: #e2e8f0;">Note:</strong> These categories have been logged to your TripMate dashboard under <em>Expenses by Category</em>. You can adjust individual line items anytime as you travel.
          </div>

          <!-- Footer -->
          <div style="text-align: center; border-top: 1px solid #1e293b; padding-top: 20px; font-size: 12px; color: #64748b;">
            <p style="margin: 0 0 6px 0;">This receipt was generated for <strong>${recipientEmail}</strong></p>
            <p style="margin: 0;">TripMate Travel Companion • Smart Planning & Expense Tracker</p>
          </div>
        </div>

      </div>
    </body>
    </html>
  `;
}

async function sendPaymentReceiptEmail({ recipientEmail, trip, paymentMethod, paymentDetails, split, transactionId, totalAmount }) {
  const transporter = await getTransporter();

  const formattedTotal = Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const paymentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const htmlContent = buildReceiptHtml({ recipientEmail, trip, paymentMethod, split, transactionId, totalAmount });

  const mailOptions = {
    from: '"TripMate Travel" <no-reply@tripmate.com>',
    to: recipientEmail,
    subject: `✈️ TripMate Payment Receipt & Booking Confirmation - ${trip.destination} (TXN: ${transactionId})`,
    html: htmlContent,
    text: `TripMate Payment Receipt\n\nDestination: ${trip.destination}\nTotal Paid: ₹${formattedTotal}\nTransaction ID: ${transactionId}\nDate: ${paymentDate}\nMethod: ${paymentMethod}\n\nCategory Split:\n` +
      (split || []).map(s => `- ${s.category} (${s.percent}%): ₹${Number(s.amount).toFixed(2)}`).join('\n')
  };

  try {
    receiptsCache.set(transactionId, htmlContent);
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('[EmailService] Email sent successfully to:', recipientEmail);
    if (previewUrl) {
      console.log('[EmailService] Ethereal Preview URL:', previewUrl);
    }
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || null,
      recipientEmail,
      isRealDelivery: Boolean((process.env.GMAIL_USER && process.env.GMAIL_PASS) || (process.env.SMTP_HOST && process.env.SMTP_USER))
    };
  } catch (err) {
    console.error('[EmailService] Error dispatching email:', err.message);
    receiptsCache.set(transactionId, htmlContent);
    return {
      success: false,
      error: err.message,
      recipientEmail
    };
  }
}

module.exports = {
  sendPaymentReceiptEmail,
  getReceiptHtml,
  buildReceiptHtml
};
