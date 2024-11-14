const accountConfirmTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Confirmation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .logo {
      text-align: center;
      margin-bottom: 20px;
    }
    .content {
      font-size: 16px;
      line-height: 1.5;
      color: #333333;
    }
    .code {
      display: inline-block;
      padding: 10px 20px;
      font-size: 18px;
      font-weight: bold;
      color: #ffffff;
      background-color: #007BFF;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      font-size: 12px;
      color: #777777;
      text-align: center;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
   <div class="logo">
      <img src="https://main.dmsqoxi56sy9p.amplifyapp.com/assets/images/EmailLogo.png" alt="MyGuideOn Logo" width="200"/>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>Welcome to MyGuideOn! Thank you for joining us. To activate your account, please enter the following confirmation code on the designated page on our site:</p>
      <p class="code">{{code}}</p>
      <p>Please note that this code is valid for only 15 MINUTES. If you did not request this signup, please ignore this email or contact us for increased security.</p>
      <p>We are excited to have you with us and look forward to accompanying you on your upcoming adventures.</p>
      <p>Best Regards,<br>The MyGuideOn Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 MyGuideOn. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`

const passwordReset = `<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .logo {
      text-align: center;
      margin-bottom: 20px;
    }
    .content {
      font-size: 16px;
      line-height: 1.5;
      color: #333333;
    }
    .code {
      display: inline-block;
      padding: 10px 20px;
      font-size: 18px;
      font-weight: bold;
      color: #ffffff;
      background-color: #007BFF;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      font-size: 12px;
      color: #777777;
      text-align: center;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <table class="container" cellpadding="0" cellspacing="0">
    <tr>
      <td>
        <div class="logo">
          <img src="https://main.dmsqoxi56sy9p.amplifyapp.com/assets/images/EmailLogo.png" alt="MyGuideOn Logo" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We have received a request to reset the password for your MyGuideOn account. Please use the code below to set a new password:</p>
          <p class="code">{{code}}</p>
          <p>This code will expire in 10 minutes. If you did not initiate this request, it is important to contact us immediately to secure your account.</p>
          <p>Thank you for your vigilance,</p>
          <p>Best Regards,<br>The MyGuideOn Team</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 MyGuideOn. All rights reserved.</p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>

`

const passwordConfirmation = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Change Confirmation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .logo {
      text-align: center;
      margin-bottom: 20px;
    }
    .content {
      font-size: 16px;
      line-height: 1.5;
      color: #333333;
    }
    .footer {
      font-size: 12px;
      color: #777777;
      text-align: center;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="https://main.dmsqoxi56sy9p.amplifyapp.com/assets/images/EmailLogo.png" alt="MyGuideOn Logo" width="200">
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>We confirm that your password has been successfully changed on your MyGuideOn account. If you did not make this change, please contact our technical support immediately to secure your account.</p>
      <p>The security of your information is our top priority.</p>
      <p>Best Regards,<br>The MyGuideOn Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 MyGuideOn. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`

export {
  passwordReset,
  passwordConfirmation,
  accountConfirmTemplate
}