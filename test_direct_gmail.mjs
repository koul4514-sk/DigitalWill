import nodemailer from 'nodemailer';
import dns from 'dns/promises';

async function testDirectGmail() {
  const recipient = "koul4514@gmail.com";
  const domain = recipient.split("@")[1];

  console.log(`Resolving MX records for ${domain}...`);
  try {
    const mxRecords = await dns.resolveMx(domain);
    mxRecords.sort((a, b) => a.priority - b.priority);
    console.log("MX Records found:", mxRecords);

    const primaryMx = mxRecords[0].exchange;
    console.log(`Primary MX host for ${domain}: ${primaryMx}`);

    // Create direct transporter to Gmail incoming MX server
    const transporter = nodemailer.createTransport({
      host: primaryMx,
      port: 25,
      secure: false,
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000,
    });

    console.log(`Sending direct email to ${recipient} via ${primaryMx}...`);
    const info = await transporter.sendMail({
      from: '"DigitalWill Portal" <security@digitalwill.ai>',
      to: recipient,
      subject: "Test 2FA OTP Code for DigitalWill",
      text: "Your verification code is 884920.",
      html: "<h1 style='color: #2563eb;'>DigitalWill OTP: 884920</h1><p>This is a real-time verification code sent directly to your Gmail inbox.</p>"
    });

    console.log("Direct delivery result:", info);
  } catch (err) {
    console.error("Direct Gmail delivery failed:", err);
  }
}

testDirectGmail();
