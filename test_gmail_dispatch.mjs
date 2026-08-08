import nodemailer from "nodemailer";

async function testGmailDispatch() {
  const recipient = "koul4514@gmail.com";
  console.log(`Attempting real email dispatch to ${recipient}...`);

  // Testing public SMTP relays
  const relays = [
    { host: "in-v3.mailjet.com", port: 587 },
    { host: "smtp-relay.brevo.com", port: 587 },
    { host: "smtp.elasticemail.com", port: 2525 },
  ];

  for (const relay of relays) {
    try {
      console.log(`Trying relay ${relay.host}:${relay.port}...`);
      const transporter = nodemailer.createTransport({
        host: relay.host,
        port: relay.port,
        secure: false,
        connectionTimeout: 5000,
      });
      await transporter.verify();
      console.log(`Relay ${relay.host} verified successfully!`);
    } catch (err) {
      console.log(`Relay ${relay.host} failed:`, err.message);
    }
  }
}

testGmailDispatch();
