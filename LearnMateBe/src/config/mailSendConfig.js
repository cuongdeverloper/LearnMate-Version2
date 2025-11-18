const sgMail = require('@sendgrid/mail');

// Set API key từ biến môi trường
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async (to, subject, otp) => {
  const htmlContent = `
  <div style="background-color:#f5f7fa; padding:40px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 8px 20px rgba(0,0,0,0.1);">
      
      <div style="padding:40px; text-align:center; background: linear-gradient(135deg, #6a11cb, #2575fc); color:#ffffff;">
        <h1 style="margin:0; font-size:24px;">🔐 Xác thực Email</h1>
        <p style="margin-top:10px; font-size:16px; color: #e0e0e0;">Cảm ơn bạn đã đăng ký. Nhập mã OTP bên dưới để hoàn tất xác thực.</p>
      </div>

      <div style="padding:40px; text-align:center;">
        <div style="display:inline-block; background:#f0f4ff; padding:20px 40px; font-size:32px; letter-spacing:10px; color:#2575fc; font-weight:bold; border-radius:10px; margin-bottom:20px;">
          ${otp}
        </div>
        <p style="font-size:14px; color:#888888; margin-bottom:30px;">Mã OTP sẽ hết hạn trong 5 phút.</p>
        <a href="#" style="display:inline-block; padding:12px 30px; background:#2575fc; color:#ffffff; border-radius:8px; text-decoration:none; font-weight:bold;">Xác thực ngay</a>
      </div>

      <div style="padding:20px; text-align:center; font-size:12px; color:#aaaaaa; border-top:1px solid #eeeeee;">
        <p style="margin:5px 0;">Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
        <p style="margin:5px 0;">&copy; 2025 LearnMate</p>
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
