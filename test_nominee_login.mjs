import { initDatabase, getPool } from './src/lib/db.ts';
import { handleBackendRequest } from './src/lib/estate-backend.ts';

async function testNomineeLogin() {
  process.env.MYSQL_HOST = "127.0.0.1";
  process.env.MYSQL_PORT = "3306";
  process.env.MYSQL_USER = "root";
  process.env.MYSQL_PASSWORD = "Saksham@123";
  process.env.MYSQL_DATABASE = "digital_will";

  await initDatabase();

  const email = "koul4514@gmail.com";

  console.log(`--- 1. Requesting Real-Time Email Verification Code for ${email} ---`);
  const sendOtpReq = new Request("http://localhost:3000/api/nominee/send-otp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email })
  });

  const sendOtpRes = await handleBackendRequest(sendOtpReq);
  const sendOtpData = await sendOtpRes.json();
  console.log("Send OTP Response Status:", sendOtpRes.status);
  console.log("Send OTP Payload:", sendOtpData);

  const otpCode = sendOtpData.code;

  console.log(`\n--- 2. Testing Nominee Login via OTP Code (${otpCode}) ---`);
  const loginOtpReq = new Request("http://localhost:3000/api/nominee/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, otp: otpCode })
  });

  const loginOtpRes = await handleBackendRequest(loginOtpReq);
  const loginOtpData = await loginOtpRes.json();
  console.log("OTP Login Response Status:", loginOtpRes.status);
  console.log("OTP Login Payload:", loginOtpData);

  process.exit(0);
}

testNomineeLogin();
