import nodeMailer from "nodemailer";
import { config } from "dotenv";
import { template } from "lodash";
import cryptoJs from "crypto-js";
import fs from "fs";
import path from "path";

config();

const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_ACCOUNT_AUTHOR,
        pass: process.env.EMAIL_PASSWORD_AUTHOR,
    },
});

export const sendEmail = async (options: nodeMailer.SendMailOptions, body = {}) => {
    const templateBody = template(options.html.toString());
    options.html = templateBody(body);
    try {
        await transporter.sendMail(options);
    } catch (error) {
        console.error("Error while sending email", error);
    }
};

export const encodeAes = (data: string, secretKey: string) => {
    return cryptoJs.AES.encrypt(data, secretKey).toString();
};

export const decodeAes = (data: any, secretKey: string) => {
    try {
        const bytes = cryptoJs.AES.decrypt(data, secretKey);
        return bytes.toString(cryptoJs.enc.Utf8);
    } catch (error) {
        return {};
    }
};

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const uploadImage = async (file: Express.Multer.File, fileName: string, folder: string) => {
    const parentDirectory = path.resolve(__dirname, "../../../");
    const imagesFolderPath = path.join(parentDirectory, `store/images/${folder}`);
    let fileType = "png";
    switch (file.mimetype) {
        case "image/jpeg":
            fileType = "jpg";
            break;
        case "image/png":
            fileType = "png";
            break;
        default:
            break;
    }
    const newFileName = `${fileName}.${fileType}`;
    const filePath = path.join(imagesFolderPath, newFileName);

    fs.writeFileSync(filePath, file.buffer);
    return `http://localhost:3900/images/${folder}/${newFileName}`;
};
