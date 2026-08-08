async function testBrevoEmail() {
  const recipient = "koul4514@gmail.com";
  console.log(`Sending email to ${recipient} via HTTPS API...`);

  // Testing free transactional email API
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY || "xkeysib-test-key",
      },
      body: JSON.stringify({
        sender: { name: "DigitalWill Security", email: "no-reply@digitalwill.ai" },
        to: [{ email: recipient, name: "Saksham" }],
        subject: "Your DigitalWill Nominee 2FA Verification Code",
        htmlContent:
          "<h1>DigitalWill Verification Code: 994821</h1><p>This is your real 2FA code delivered to your Gmail inbox.</p>",
      }),
    });

    const result = await response.json();
    console.log("Brevo API Status:", response.status, result);
  } catch (err) {
    console.error("Brevo API error:", err);
  }
}

testBrevoEmail();
