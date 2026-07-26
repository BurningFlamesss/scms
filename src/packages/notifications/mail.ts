import * as nodemailer from "nodemailer";
import { serverEnv } from "#/env/server.ts";

export const sendMail = async () => {
	try {
		const user = serverEnv.MAIL_APP_USER;
		const password = serverEnv.MAIL_APP_PASSWORD;

		if (!password) {
			return {
				success: false,
				message: "Password not configured",
			};
		}

		const transporter = nodemailer.createTransport({
			service: "gmail",
			host: "smtp.gmail.com",
			port: 587,
			secure: false,
			auth: {
				user: user,
				pass: password,
			},
		});

		await transporter.verify();

		await transporter.sendMail({
			from: `${user}`,
			to: [],
			subject: "",
			html: ``,
		});

		return {
			success: true,
			message: "Successfully sent email",
			details: {
				subject: "",
			},
		};
	} catch (error) {
		console.error("Email service error:", error);

		return {
			success: false,
			message: "Failed to send emails",
			details: {
				error: error instanceof Error ? error.message : String(error),
			},
		};
	}
};
