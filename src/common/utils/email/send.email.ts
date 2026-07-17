import { EMAIL_APP, EMAIL_App_PASSWORD } from '../../../config/config';
import { BadRequestException } from '../../exceptions/domain.exceptions';
import Mail from 'nodemailer/lib/mailer/index';
import nodemailer from 'nodemailer'



export const sendEmail = async ({
    to,
    cc,
    bcc,
    subject,
    html,
    attachments = []
}:Mail.Options):Promise<void> => {
  if (!to && !cc && !bcc) {
    throw new BadRequestException('invalid recipient')
  }
  if (!(html as string)?.length && !attachments?.length) {
        throw new BadRequestException('invalid recipient')
  }
    const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth: {
        user: EMAIL_APP,
        pass: EMAIL_App_PASSWORD,
    },
    });

    const info = await transporter.sendMail({
    from: `SARAHA_APP${EMAIL_APP}`, // sender address
      to,
    cc,
    bcc,
    subject,
    html,
    attachments,
  });
  console.log(info);
  
}








