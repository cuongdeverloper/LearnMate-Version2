const sgMail = require('@sendgrid/mail');

// Set API key từ biến môi trường
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async (to, subject, otp) => {
  const htmlContent = `
  <div style="background-color: #f2f4f6; padding: 40px 0; font-family: 'Segoe UI', sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <div style="padding: 30px 40px; text-align: center;">
        <h2 style="color: #333333; margin-bottom: 10px;">🔐 Xác thực Email của bạn</h2>
        <p style="font-size: 16px; color: #555555;">Cảm ơn bạn đã đăng ký. Vui lòng sử dụng mã OTP bên dưới để xác thực email:</p>
        <div style="margin: 30px 0;">
          <span style="display: inline-block; background-color: #f0f0f0; padding: 15px 30px; font-size: 28px; letter-spacing: 8px; color: #007bff; font-weight: bold; border-radius: 8px;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #888888;">Mã OTP này sẽ hết hạn trong 5 phút.</p>      
        <hr style="margin: 40px 0; border: none; border-top: 1px solid #eeeeee;">
        <p style="font-size: 12px; color: #aaaaaa;">Nếu bạn không yêu cầu, bạn có thể bỏ qua email này.</p>
      </div>
    </div>
  </div>
  `;

  try {
    const msg = {
      to,
      from: process.env.MAIL_SDN_USERNAME, 
      subject,
      html: htmlContent,
    };

    const response = await sgMail.send(msg);
    console.log('✅ Email sent successfully via SendGrid!');
    return true;
  } catch (error) {
    console.error('❌ Failed to send email via SendGrid:', error);
    return false;
  }
};

module.exports = { sendMail };
