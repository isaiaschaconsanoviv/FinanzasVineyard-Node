import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import * as React from 'react';

interface EmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement; // The React Email component
}

// Configurar el transportador de nodemailer usando SMTP (Gmail)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Utility function to send emails via Nodemailer.
 * @param options Email options including to, subject, and the React Email template.
 * @returns Object with data or error.
 */
export async function enviarCorreo({ to, subject, react }: EmailOptions) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("⚠️ SMTP_USER o SMTP_PASS no están configurados en el .env.");
      console.warn("Simulando envío de correo a:", to);
      console.warn("Asunto:", subject);
      return { data: { id: "simulated_id" }, error: null };
    }

    // Renderizamos el componente React a una cadena de HTML
    const html = await render(react);

    // Enviamos el correo a través de SMTP
    const info = await transporter.sendMail({
      from: `"Finanzas Vineyard" <${process.env.SMTP_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      html, // html body
    });

    return { data: info, error: null };
  } catch (error) {
    console.error("Excepción al enviar correo con Nodemailer:", error);
    return { data: null, error };
  }
}
