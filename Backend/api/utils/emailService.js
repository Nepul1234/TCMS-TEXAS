import {transporter} from '../config/mailer.js';
import errorHandler from "./error.js";

export const sendPaymentReceipt = async (studentEmail, studentName, amount,class_name,grade) => {
    const mailOptions = {
        from: `"Texas Institute Galle" <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: 'Payment Confirmation - Texas Institute Galle',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
            <div style="background-color: #FFFFFF; padding: 20px; border-bottom: 4px solid #007bff;display: flex; flex-direction: column; align-items: center;justify-content: center;">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7vFjF1iF-N_8FpALJMai32zhBUibWruzmFA&s" alt="Texas Institute Logo" style="max-width: 100px; height: auto;">
            </div>
      
            <div style="padding: 30px 20px;">
              <h2 style="color: #007bff; margin-bottom: 25px;">Hi ${studentName},</h2>
              
              <div style="background-color: #e9ecef; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <p style="margin: 0; font-size: 16px;">✅ Your payment has been successfully received!</p>
              </div>
      
              <div style="margin-bottom: 30px;">
                <h3 style="color: #28a745; margin-bottom: 15px;">Payment Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">Amount Paid:</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; text-align: right;"><strong>Rs.${amount}</strong></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">Class:</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; text-align: right;">${class_name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">Grade:</td>
                    <td style="padding: 8px 0; text-align: right;">Grade ${grade}</td>
                  </tr>
                </table>
              </div>
      
              <p style="font-size: 16px; line-height: 1.6;">
                Thank you for your payment for Texas Institute. 
                Your transaction has been confirmed and recorded in our system. 
                This is for demo purpose only. 
                Dont'be panic
              </p>
      
              <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px;">
                  Need assistance?<br>
                  📞 Contact us: +94 77 123 4567<br>
                  📧 Email: support@texasinstitute.lk
                </p>
              </div>
            </div>
      
            <div style="background-color: #007bff; color: white; padding: 15px; text-align: center; font-size: 12px;">
              <p style="margin: 0;">
                Texas Institute <br>
                123 Road, Galle, Sri Lanka<br>
                © ${new Date().getFullYear()} Texas Development Team. All rights reserved.
              </p>
            </div>
          </div>
        `
      };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${studentEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
  } 
};

export const sendAttendanceReceipt = async (studentEmail, studentName,class_name,grade, date, time) => {
    const mailOptions = {
        from: `"Texas Institute Galle" <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: 'Attendance Confirmation - Texas Institute Galle',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
            <div style="background-color: #FFFFFF; padding: 20px; border-bottom: 4px solid #007bff;display: flex; flex-direction: column; align-items: center;justify-content: center;">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7vFjF1iF-N_8FpALJMai32zhBUibWruzmFA&s" alt="Texas Institute Logo" style="max-width: 100px; height: auto;">
            </div>
      
            <div style="padding: 30px 20px;">
              <h2 style="color: #007bff; margin-bottom: 25px;">Hi ${studentName},</h2>
              
              <div style="background-color: #e9ecef; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <p style="margin: 0; font-size: 16px;">✅ Your attendance has been successfully recorded!</p>
              </div>
      
              <div style="margin-bottom: 30px;">
                <h3 style="color: #28a745; margin-bottom: 15px;">Attendance details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">Attendance date and time</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; text-align: right;"><strong>${date} + ${time}</strong></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;">Class:</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; text-align: right;">${class_name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">Grade:</td>
                    <td style="padding: 8px 0; text-align: right;">Grade ${grade}</td>
                  </tr>
                </table>
              </div>
      
              <p style="font-size: 16px; line-height: 1.6;">
                Thank you for your payment for Texas Institute. 
                Your transaction has been confirmed and recorded in our system. 
                This is for demo purpose only. 
                Dont'be panic
              </p>
      
              <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px;">
                  Need assistance?<br>
                  📞 Contact us: +94 77 123 4567<br>
                  📧 Email: support@texasinstitute.lk
                </p>
              </div>
            </div>
      
            <div style="background-color: #007bff; color: white; padding: 15px; text-align: center; font-size: 12px;">
              <p style="margin: 0;">
                Texas Institute <br>
                123 Road, Galle, Sri Lanka<br>
                © ${new Date().getFullYear()} Texas Development Team. All rights reserved.
              </p>
            </div>
          </div>
        `
      };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${studentEmail}`);
  } catch (error) {
    console.log('Error sending email:', error);
    return next(errorHandler(500, 'Failed to send attendance email'));
  } 
};

