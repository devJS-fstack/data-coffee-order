import constant from "src/utils/constant";

export const WelcomeEmail = {
    subject: `Welcome to The Coffee House`,
    body: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="" />
        <meta name="author" content="" />
        <title>Console</title>
    </head>
    <body
        style="
        padding: 24px;
        background: #e5e5e5;
        margin: 0 auto;
        font-family: 'Arial';
        font-size: 14px;
        line-height: 24px;
        text-align: left;
        color: #1f2937;
        "
    >
        <table
        width="600"
        cellspacing="0"
        cellpadding="0"
        style="
            margin: 0 auto;
            background-color: #fff;
            border-radius: 16px;
            overflow: hidden;
        "
        >
        <tr>
            <th
            style="
                background-color: #e57905;
                padding: 24px;
                display: flex;
                justify-content: center;
            "
            >
            <a href="http://${constant.mail.websiteUrl}" style="text-decoration: none; width: 100%;text-align: center;">
                <span style="font-size: 22px; font-weight: 700; color: #fff;"
                >THE COFFEE HOUSE</span
                >
            </a>
            </th>
        </tr>
        <tbody>
            <tr>
            <td style="padding: 24px;">
                <table cellspacing="0" cellpadding="0">
                <tr>
                    <td>
                    <tr>
                        <td style="padding-bottom: 16px; font-weight: 700;">
                        Hi <%= name %>,
                        </td>
                    </tr>
                    <tr>
                        <td>
                        Welcome to
                        <a
                            href="http://${constant.mail.websiteUrl}"
                            style="
                            color: #4f71e3;
                            font-weight: 700;
                            text-underline-offset: 2px;
                            "
                            >The Coffee House</a
                        >
                        </td>
                    </tr>
                    <tr>
                        <td>Please use following information to login:</td>
                    </tr>
                    <tr>
                        <td style="padding-top: 16px; padding-bottom: 16px;">
                        <div
                            style="
                            background-color: #eff3ff;
                            padding: 16px;
                            border-radius: 8px;
                            "
                        >
                            <table>
                            <tr>
                                <td>Website</td>
                                <td style="padding-left: 16px; font-weight: 700;">
                                <a
                                    href="http://${constant.mail.websiteUrl}"
                                    style="
                                    color: #1f2937;
                                    font-weight: 700;
                                    text-decoration: none;
                                    "
                                    >${constant.mail.websiteUrl}</a
                                >
                                </td>
                            </tr>
                            <tr>
                                <td>Email</td>
                                <td style="padding-left: 16px; font-weight: 700;">
                                    <%= email %>
                                </td>
                            </tr>
                            <tr>
                                <td>Password</td>
                                <td style="padding-left: 16px; font-weight: 700;">
                                <%= password %>
                                </td>
                            </tr>
                            </table>
                        </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding-bottom: 16px;">
                        Regards,
                        <br />
                        <div style="font-weight: 700;">Coffee Team,</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="color: #6b7280; line-height: 20px;">
                        <div style="padding-bottom: 8px;">
                            This email is automated. Please do not reply. If you
                            need assistance please contact
                            <a
                            href="mailto:support@pascal.studio"
                            style="
                                color: #4f71e3;
                                text-decoration: none;
                                font-weight: 700;
                            "
                            >support@gmail.com</a
                            >
                        </div>
                        </td>
                    </tr>
                    </td>
                </tr>
                </table>
            </td>
            </tr>
        </tbody>
        </table>
    </body>
    </html> 
    `,
};
