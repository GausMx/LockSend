const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVoucherEmail = async ({
  to,
  name,
  voucherCode,
  amountNaira,
  currency,
  amountForeign,
  recipientName,
  expiresAt,
  voucherId,
}) => {
  const expiryDate = new Date(expiresAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const redemptionLink = `${process.env.CLIENT_URL}/redeem/${voucherCode}`;
  const voucherLink = `${process.env.CLIENT_URL}/voucher/${voucherId}`;

  const formattedNaira = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amountNaira);

  const currencySymbols = { GBP: "£", USD: "$", CAD: "CA$" };
  const symbol = currencySymbols[currency] || "";

  await resend.emails.send({
    from: "LockSend <onboarding@resend.dev>",
    to,
    subject: `Your LockSend Voucher — ${voucherCode}`,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#0A1628;font-family:system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#111f3a;border:1px solid #1A3A6B;border-radius:4px;">

      <tr>
        <td style="background:#1A3A6B;padding:24px 40px;">
          <p style="margin:0;font-size:22px;font-weight:700;color:#C9922A;letter-spacing:2px;">LockSend</p>
          <p style="margin:4px 0 0;font-size:11px;color:#8B98AE;letter-spacing:1px;">SCOOLYNK TECHNOLOGIES</p>
        </td>
      </tr>

      <tr>
        <td style="padding:40px;">
          <p style="margin:0 0 6px;font-size:13px;color:#8B98AE;">Hello, ${name}</p>
          <h1 style="margin:0 0 28px;font-size:24px;color:#F5F0E8;font-weight:600;">Your voucher is ready.</h1>

          <div style="background:#0A1628;border:1px solid #C9922A;border-radius:4px;padding:24px;text-align:center;margin-bottom:32px;">
            <p style="margin:0 0 8px;font-size:11px;color:#8B98AE;text-transform:uppercase;letter-spacing:3px;">Voucher Code</p>
            <p style="margin:0;font-size:38px;font-weight:700;color:#C9922A;letter-spacing:10px;font-family:monospace;">${voucherCode}</p>
          </div>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #1A3A6B55;">
                <p style="margin:0;font-size:11px;color:#8B98AE;text-transform:uppercase;letter-spacing:1px;">Amount Paid</p>
              </td>
              <td style="padding:10px 0;border-bottom:1px solid #1A3A6B55;text-align:right;">
                <p style="margin:0;font-size:14px;color:#F5F0E8;font-weight:500;">${symbol}${amountForeign} ${currency}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #1A3A6B55;">
                <p style="margin:0;font-size:11px;color:#8B98AE;text-transform:uppercase;letter-spacing:1px;">Naira Value</p>
              </td>
              <td style="padding:10px 0;border-bottom:1px solid #1A3A6B55;text-align:right;">
                <p style="margin:0;font-size:14px;color:#F5F0E8;font-weight:500;">${formattedNaira}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #1A3A6B55;">
                <p style="margin:0;font-size:11px;color:#8B98AE;text-transform:uppercase;letter-spacing:1px;">For</p>
              </td>
              <td style="padding:10px 0;border-bottom:1px solid #1A3A6B55;text-align:right;">
                <p style="margin:0;font-size:14px;color:#F5F0E8;font-weight:500;">${recipientName}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0;">
                <p style="margin:0;font-size:11px;color:#8B98AE;text-transform:uppercase;letter-spacing:1px;">Expires</p>
              </td>
              <td style="padding:10px 0;text-align:right;">
                <p style="margin:0;font-size:14px;color:#F5F0E8;font-weight:500;">${expiryDate}</p>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 16px;font-size:13px;color:#8B98AE;line-height:1.7;">
            Share the link below with your family member. The hospital cashier visits it to claim the funds. You will receive an SMS and email to approve before any money is released.
          </p>

          <div style="background:#0A1628;border:1px solid #1A3A6B;border-radius:4px;padding:16px;margin-bottom:28px;word-break:break-all;">
            <p style="margin:0 0 4px;font-size:11px;color:#8B98AE;text-transform:uppercase;letter-spacing:1px;">Redemption Link</p>
            <a href="${redemptionLink}" style="color:#C9922A;font-size:13px;font-family:monospace;text-decoration:none;">${redemptionLink}</a>
          </div>

          <a href="${voucherLink}" style="display:block;background:#C9922A;color:#0A1628;text-align:center;padding:14px;border-radius:2px;font-weight:600;font-size:14px;text-decoration:none;">
            View Voucher on Dashboard
          </a>
        </td>
      </tr>

      <tr>
        <td style="border-top:1px solid #1A3A6B;padding:20px 40px;">
          <p style="margin:0;font-size:11px;color:#8B98AE;">Scoolynk Technologies · CAC Registered · Nigeria</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`,
  });
};

module.exports = { sendVoucherEmail };