export type Content = {
    subject: string;
    content: {
        title?: string;
        description: string;
        warning?: string;
        email: string;
    };
    product?: {
        items: {
            productId?: string;
            image: string;
            name: string;
            quantity: number | null;
            price: number;
        }[];
        totalPrice: number;
        shippingfee: number;
    };
    link: {
        linkName: string;
        linkHerf: string;
    };
    user?: {
        name: string;
        phone: string;
        email: string;
        address: string;
    };
};
type Template = 'Verify' | 'ResetPassword' | 'UpdateStatusOrder';
export const templateMail = (template: Template, mailContent: Content) => {
    switch (template) {
        case 'Verify':
            return `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kích hoạt tài khoản - VERTA SPORT</title>
      <style>
      body {
        font-family: "Poppins", sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f7f9fc;
      }
      .container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        background: #edefef;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        padding: 20px;
        background-color: #1e3a8a;
        color: #ffffff;
        border-radius: 10px 10px 0 0;
        margin-bottom: 20px;
      }
      .header img {
        max-width: 180px;
        height: auto;
      }
      .content {
        padding: 20px;
        color: #333;
      }
      .content h1 {
        color: #1e3a8a;
        font-size: 24px;
        margin-bottom: 20px;
      }
      .content p {
        line-height: 1.6;
        margin-bottom: 20px;
      }
      .btn {
        display: inline-block;
        background-color: #1e3a8a;
        color: #ffffff;
        padding: 12px 25px;
        border-radius: 5px;
        text-decoration: none;
        font-weight: 600;
        font-size: 16px;
        margin-top: 10px;
        transition: background-color 0.3s ease;
      }
      .btn:hover {
        background-color: #123b7b;
      }
      .background {
        background-color: #f7f9fc;
        border-radius: 10px;
      }
      .footer {
        text-align: center;
        padding: 20px;
        font-size: 14px;
        color: #777;
        border-top: 1px solid #e0e0e0;
      }
      .footer p {
        margin: 0;
      }
    </style>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
    <div style="max-width: 700px; margin: 20px auto; background-color: white; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #2c3e50, #3498db); color: white; padding: 30px; text-align: center; border-top-left-radius: 10px; border-top-right-radius: 10px;">
            <img src="https://res.cloudinary.com/dpplfiyki/image/upload/v1739560660/0d52d8d6-9047-4c47-aa3f-75b82772b30f-removebg-preview_1_r1ghvy.png" alt="VERTA SPORT LOGO" style="max-height: 80px; margin-bottom: 15px;">
            <h1 style="margin: 0; font-size: 24px;">${mailContent?.content?.title}</h1>
        </div>
        
        <div style="padding: 30px;">
            <h2 style="color: #2c3e50;">Xin chào, ${mailContent?.content?.email}!</h2>
            
            <p style="color: #333;">${mailContent.content.description}</p>
            <div style="background-color: #f9f9f9; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0;">
               <a style="color: white" href="${mailContent?.link?.linkHerf}" class="btn"
            >${mailContent?.link?.linkName}</a
          >
            </div>
            ${
                mailContent.content.warning
                    ? `
                <div style="background-color: #ffdddd; border-left: 4px solid #f44336; color: #d32f2f; padding: 15px; margin-top: 20px;">
                    <p>${mailContent.content.warning}</p>
                </div>
            `
                    : ''
            }
        </div>

        <div style="background-color: #2c3e50; color: white; padding: 20px; text-align: center;">
            <p>© 2025 Verta Sport. Đã đăng ký bản quyền</p>
            <p>Trải nghiệm mua sắm hoàn hảo</p>
        </div>
    </div>
</body>
</html>`;
        default:
            return 'none';
    }
};
