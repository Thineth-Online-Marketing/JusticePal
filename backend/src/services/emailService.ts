import nodemailer from 'nodemailer';

// ─── Transporter Setup ──────────────────────────────────────────
// Uses environment variables for SMTP config.
// For development, you can use a service like Gmail or Mailtrap.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
});

const FROM_ADDRESS = process.env.EMAIL_FROM || 'JusticePal <noreply@justicepal.lk>';

// ─── Email Templates ────────────────────────────────────────────

/**
 * Send booking confirmation email to a client.
 */
export async function sendBookingConfirmation(params: {
  toEmail: string;
  clientName: string;
  lawyerName: string;
  scheduledAt: Date;
  consultationType?: string;
}) {
  const { toEmail, clientName, lawyerName, scheduledAt, consultationType } = params;
  const dateStr = scheduledAt.toLocaleDateString('en-LK', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const timeStr = scheduledAt.toLocaleTimeString('en-LK', {
    hour: '2-digit', minute: '2-digit',
  });

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1B3A6B, #112549); padding: 32px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 24px; margin: 0;">⚖️ JusticePal</h1>
        <p style="color: #94a3b8; font-size: 14px; margin: 8px 0 0;">Booking Confirmation</p>
      </div>
      <div style="padding: 32px;">
        <p style="color: #334155; font-size: 16px;">Dear <strong>${clientName}</strong>,</p>
        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
          Your consultation has been booked successfully. Here are your booking details:
        </p>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Lawyer</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${lawyerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Date</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${dateStr}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Time</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${timeStr}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Type</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${consultationType || 'Video Consultation'}</td>
            </tr>
          </table>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://justicepal.akalankanime11.workers.dev'}/dashboard"
             style="background: #F97316; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            View in Dashboard
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
          If you need to reschedule, please contact your lawyer through the platform.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: toEmail,
      subject: `Booking Confirmed – Consultation with ${lawyerName}`,
      html,
    });
    console.log(`📧 Booking confirmation sent to ${toEmail}`);
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
    // Don't throw — email failure shouldn't break the flow
  }
}

/**
 * Send payment receipt email to a client.
 */
export async function sendPaymentReceipt(params: {
  toEmail: string;
  clientName: string;
  lawyerName: string;
  amount: number;
  currency: string;
  paidAt: Date;
}) {
  const { toEmail, clientName, lawyerName, amount, currency, paidAt } = params;

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1B3A6B, #112549); padding: 32px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 24px; margin: 0;">⚖️ JusticePal</h1>
        <p style="color: #94a3b8; font-size: 14px; margin: 8px 0 0;">Payment Receipt</p>
      </div>
      <div style="padding: 32px;">
        <p style="color: #334155; font-size: 16px;">Dear <strong>${clientName}</strong>,</p>
        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
          We've received your payment. Here is your receipt:
        </p>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Lawyer</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${lawyerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Amount</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${currency} ${amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Date</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${paidAt.toLocaleDateString('en-LK')}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Status</td>
              <td style="padding: 8px 0; font-weight: 600; text-align: right;">
                <span style="background: #dcfce7; color: #16a34a; padding: 4px 12px; border-radius: 20px; font-size: 12px;">✓ Paid</span>
              </td>
            </tr>
          </table>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
          This is an automatically generated receipt. For any issues, please contact support.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: toEmail,
      subject: `Payment Receipt – ${currency} ${amount.toLocaleString()} for ${lawyerName}`,
      html,
    });
    console.log(`📧 Payment receipt sent to ${toEmail}`);
  } catch (error) {
    console.error('Failed to send payment receipt email:', error);
  }
}

/**
 * Send appointment reminder email.
 */
export async function sendAppointmentReminder(params: {
  toEmail: string;
  name: string;
  lawyerName: string;
  scheduledAt: Date;
}) {
  const { toEmail, name, lawyerName, scheduledAt } = params;
  const dateStr = scheduledAt.toLocaleDateString('en-LK', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const timeStr = scheduledAt.toLocaleTimeString('en-LK', {
    hour: '2-digit', minute: '2-digit',
  });

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #F97316, #ea6b0a); padding: 32px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 24px; margin: 0;">⏰ Appointment Reminder</h1>
        <p style="color: #fef3c7; font-size: 14px; margin: 8px 0 0;">JusticePal</p>
      </div>
      <div style="padding: 32px;">
        <p style="color: #334155; font-size: 16px;">Hi <strong>${name}</strong>,</p>
        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
          This is a reminder that your consultation with <strong>${lawyerName}</strong> is coming up:
        </p>
        <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="color: #c2410c; font-size: 18px; font-weight: 700; margin: 0;">${dateStr}</p>
          <p style="color: #ea580c; font-size: 14px; margin: 4px 0 0;">${timeStr}</p>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://justicepal.akalankanime11.workers.dev'}/dashboard"
             style="background: #1B3A6B; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: toEmail,
      subject: `Reminder: Consultation with ${lawyerName} on ${dateStr}`,
      html,
    });
    console.log(`📧 Reminder sent to ${toEmail}`);
  } catch (error) {
    console.error('Failed to send reminder email:', error);
  }
}
