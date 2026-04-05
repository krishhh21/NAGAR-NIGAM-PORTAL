// Generate Ethereal email credentials for testing
const nodemailer = require('nodemailer');

async function generateEtherealCredentials() {
  try {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();

    console.log('Ethereal Email Credentials for Testing:');
    console.log('=====================================');
    console.log('User:', testAccount.user);
    console.log('Pass:', testAccount.pass);
    console.log('Host:', 'smtp.ethereal.email');
    console.log('Port:', 587);
    console.log('');
    console.log('Add these to your .env file:');
    console.log(`ETHEREAL_USER=${testAccount.user}`);
    console.log(`ETHEREAL_PASS=${testAccount.pass}`);
    console.log('');
    console.log('You can view sent emails at: https://ethereal.email');
  } catch (error) {
    console.error('Error generating credentials:', error);
  }
}

generateEtherealCredentials();