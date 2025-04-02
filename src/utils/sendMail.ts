import config from '@/config/env.config';
import { templateMail } from '@/template/Mailtemplate';
import nodemailer from 'nodemailer';
export type template = {
    subject: string;
    content: {
        title?: string;
        description: string;
        warning?: string;
        email: string;
    };
    voucher?: {
        name: string;
        code: string;
        discount: number;
    };
    link: {
        linkName: string;
        linkHerf: string;
    };
};
const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,
    secure: false,
    auth: {
        user: config.nodeMailer.email,
        pass: config.nodeMailer.password,
    },
});

export const sendMail = async ({
    email,
    template,
    type,
}: {
    email: string;
    template: template;
    type: 'Verify' | 'ResetPassword' | 'UpdateStatusOrder' | 'BanAccount' | 'UnbanAccount';
}) => {
    const info = await transporter.sendMail({
        from: 'VERTA SPORT <no-reply@vertasport.com>',
        to: email,
        subject: `${template?.subject}`,
        html: templateMail(type, template),
        replyTo: undefined,
    });
    console.log('message send : %s', info.messageId);
};
