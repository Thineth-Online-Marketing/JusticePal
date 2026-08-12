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
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://justicepal.akalankanime11.workers.dev';

// ─── Email Templates ────────────────────────────────────────────

/**
 * Send welcome email to a newly registered client.
 */
export async function sendWelcomeEmail(params: {
  toEmail: string;
  name: string;
}) {
  const { toEmail, name } = params;

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1B3A6B, #112549); padding: 40px 32px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 28px; margin: 0;">⚖️ Welcome to JusticePal</h1>
        <p style="color: #94a3b8; font-size: 14px; margin: 12px 0 0;">Your trusted legal assistance platform</p>
      </div>
      <div style="padding: 32px;">
        <p style="color: #334155; font-size: 16px;">Dear <strong>${name}</strong>,</p>
        <p style="color: #64748b; font-size: 14px; line-height: 1.7;">
          Thank you for joining JusticePal! We're glad to have you on board. Our platform connects you with verified legal professionals across Sri Lanka to help you with any legal matter.
        </p>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #1B3A6B; font-size: 15px; margin: 0 0 12px;">Here's what you can do:</h3>
          <ul style="color: #64748b; font-size: 13px; line-height: 2; padding-left: 20px; margin: 0;">
            <li>🔍 <strong>Find a Lawyer</strong> — Use AI-powered search to match with the right expert</li>
            <li>📅 <strong>Book Consultations</strong> — Schedule video or in-person meetings</li>
            <li>💬 <strong>Chat with AI</strong> — Get instant legal guidance</li>
            <li>📄 <strong>Draft Documents</strong> — Generate legal documents easily</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${FRONTEND_URL}/client-dashboard"
             style="background: #F97316; color: #ffffff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 14px;">
            Go to Your Dashboard
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
          If you have any questions, feel free to reach out through our platform.
        </p>
      </div>
      <div style="background: #f1f5f9; padding: 16px 32px; text-align: center;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} JusticePal. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: toEmail,
      subject: 'Welcome to JusticePal — Your Legal Journey Starts Here!',
      html,
    });
    console.log(`📧 Welcome email sent to ${toEmail}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}

/**
 * Send welcome email to a newly registered lawyer.
 */
export async function sendLawyerWelcomeEmail(params: {
  toEmail: string;
  name: string;
}) {
  const { toEmail, name } = params;

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1B3A6B, #112549); padding: 40px 32px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 28px; margin: 0;">⚖️ Welcome to JusticePal</h1>
        <p style="color: #94a3b8; font-size: 14px; margin: 12px 0 0;">Legal Professional Portal</p>
      </div>
      <div style="padding: 32px;">
        <p style="color: #334155; font-size: 16px;">Dear <strong>${name}</strong>,</p>
        <p style="color: #64748b; font-size: 14px; line-height: 1.7;">
          Welcome to JusticePal! Your lawyer account has been created successfully. Once your profile is verified by our admin team, you'll be visible to clients seeking legal assistance.
        </p>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <h3 style="color: #1B3A6B; font-size: 15px; margin: 0 0 12px;">Next Steps:</h3>
          <ul style="color: #64748b; font-size: 13px; line-height: 2; padding-left: 20px; margin: 0;">
            <li>📋 <strong>Complete Your Profile</strong> — Add specializations, experience, and your photo</li>
            <li>✅ <strong>Verification</strong> — Our team will review and verify your credentials</li>
            <li>📅 <strong>Set Your Availability</strong> — Configure your calendar for consultations</li>
            <li>💼 <strong>Start Accepting Clients</strong> — Receive bookings once verified</li>
          </ul>
        </div>
        <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="color: #c2410c; font-size: 13px; margin: 0; text-align: center;">
            ⏳ <strong>Verification usually takes 1-2 business days.</strong> We'll notify you once approved.
          </p>
        </div>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${FRONTEND_URL}/lawyer-dashboard"
             style="background: #F97316; color: #ffffff; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 14px;">
            Go to Lawyer Dashboard
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
          If you need assistance, please contact our support team.
        </p>
      </div>
      <div style="background: #f1f5f9; padding: 16px 32px; text-align: center;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} JusticePal. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: toEmail,
      subject: 'Welcome to JusticePal — Your Lawyer Account is Ready!',
      html,
    });
    console.log(`📧 Lawyer welcome email sent to ${toEmail}`);
  } catch (error) {
    console.error('Failed to send lawyer welcome email:', error);
  }
}

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
          <a href="${FRONTEND_URL}/client-dashboard"
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
 * Send booking notification email to the lawyer when a client books.
 */
export async function sendBookingNotificationToLawyer(params: {
  toEmail: string;
  lawyerName: string;
  clientName: string;
  scheduledAt: Date;
  caseDescription?: string;
}) {
  const { toEmail, lawyerName, clientName, scheduledAt, caseDescription } = params;
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
        <p style="color: #94a3b8; font-size: 14px; margin: 8px 0 0;">New Consultation Booking</p>
      </div>
      <div style="padding: 32px;">
        <p style="color: #334155; font-size: 16px;">Dear <strong>${lawyerName}</strong>,</p>
        <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
          A new consultation has been booked by a client. Here are the details:
        </p>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Client</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${clientName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Date</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${dateStr}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Time</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right;">${timeStr}</td>
            </tr>
            ${caseDescription && caseDescription !== 'No specific notes provided.' ? `
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 13px;">Case Notes</td>
              <td style="padding: 8px 0; color: #1e293b; font-weight: 600; text-align: right; max-width: 300px;">${caseDescription.substring(0, 150)}${caseDescription.length > 150 ? '...' : ''}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="color: #15803d; font-size: 13px; margin: 0; text-align: center;">
            ✅ Please review and confirm this appointment from your dashboard.
          </p>
        </div>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${FRONTEND_URL}/lawyer-dashboard"
             style="background: #1B3A6B; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
            View in Dashboard
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
          You can manage all your appointments from your JusticePal dashboard.
        </p>
      </div>
      <div style="background: #f1f5f9; padding: 16px 32px; text-align: center;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} JusticePal. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: FROM_ADDRESS,
      to: toEmail,
      subject: `New Booking – Consultation with ${clientName} on ${dateStr}`,
      html,
    });
    console.log(`📧 Booking notification sent to lawyer ${toEmail}`);
  } catch (error) {
    console.error('Failed to send booking notification to lawyer:', error);
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
          <a href="${FRONTEND_URL}/client-dashboard"
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
