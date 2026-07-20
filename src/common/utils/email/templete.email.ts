export const emailTemplate = ({
  title = "OTP Verification",
  otp = "123456",
}: {
  title?: string;
  otp?: string;
}): string => {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>${title}</title>
</head>

<body style="
    margin:0;
    padding:0;
    background:#f5f1eb;
    font-family:Arial, Helvetica, sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr>
<td align="center">

<table
    width="450"
    cellpadding="0"
    cellspacing="0"
    style="
        background:#ffffff;
        border-radius:18px;
        overflow:hidden;
        box-shadow:0 12px 35px rgba(0,0,0,.08);
    "
>

<tr>
<td
    align="center"
    style="
        background:#C8A27A;
        padding:28px;
    "
>
<h2
    style="
        margin:0;
        color:white;
        font-size:24px;
        letter-spacing:1px;
    "
>
Task Management System
</h2>
</td>
</tr>

<tr>
<td align="center" style="padding:35px 30px 15px;">
<h1
    style="
        margin:0;
        color:#5A4634;
        font-size:24px;
    "
>
${title}
</h1>

<p
    style="
        color:#7A6A5A;
        margin-top:15px;
        line-height:24px;
        font-size:15px;
    "
>
Use the verification code below to continue.
</p>
</td>
</tr>

<tr>
<td align="center" style="padding:20px 0 10px;">

<div
style="
display:inline-block;
background:#E6D5C3;
color:#5A4634;
padding:18px 40px;
border-radius:14px;
font-size:30px;
font-weight:bold;
letter-spacing:8px;
font-family:monospace;
"
>
${otp}
</div>

</td>
</tr>

<tr>
<td align="center">

<p
style="
color:#8C7B6A;
font-size:14px;
margin-top:20px;
"
>
This verification code will expire in <b>2 minutes</b>.
</p>

</td>
</tr>

<tr>
<td align="center" style="padding:25px 0;">

<a
href="#"
style="
background:#B58A63;
color:white;
padding:14px 30px;
text-decoration:none;
border-radius:10px;
display:inline-block;
font-weight:bold;
"
>
Verify Account
</a>

</td>
</tr>

<tr>
<td
align="center"
style="
padding:20px;
border-top:1px solid #EFE7DF;
"
>

<p
style="
margin:0;
font-size:13px;
color:#9B8B7B;
line-height:22px;
"
>
If you didn't request this verification, you can safely ignore this email.
</p>

<p
style="
margin-top:15px;
font-size:12px;
color:#B7A99B;
"
>
© ${new Date().getFullYear()} Task Management System. All rights reserved.
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
};