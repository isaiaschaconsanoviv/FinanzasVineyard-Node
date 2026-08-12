import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  nombre: string;
  usuario: string;
  setupLink: string;
}

export const ResetPasswordEmail = ({
  nombre,
  usuario,
  setupLink,
}: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Tu contraseña de Finanzas Vineyard ha sido restablecida.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Hola, {nombre || "Usuario"}</Heading>
          
          <Text style={text}>
            Se ha solicitado un restablecimiento de contraseña para tu cuenta en el sistema de <strong>Finanzas Vineyard</strong>.
          </Text>
          
          <Section style={credentialsSection}>
            <Text style={textCredentials}>
              <strong>Usuario asignado:</strong> {usuario}
            </Text>
          </Section>

          <Text style={text}>
            Haz clic en el siguiente botón para establecer tu nueva contraseña de forma segura. Este enlace expira en 24 horas.
          </Text>

          <Section style={buttonContainer}>
            <Link style={button} href={setupLink}>
              Establecer nueva contraseña
            </Link>
          </Section>

          <Text style={footer}>
            Si tú no solicitaste este correo, por favor ignóralo o contacta al administrador del sistema.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ResetPasswordEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.05)",
  maxWidth: "600px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 20px 0",
  padding: "0",
};

const text = {
  color: "#555",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 20px 0",
};

const credentialsSection = {
  backgroundColor: "#f4f4f5",
  padding: "20px",
  borderRadius: "6px",
  marginBottom: "20px",
};

const textCredentials = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 10px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#8b5cf6", // Accent primary color matching the app
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
  marginTop: "40px",
  borderTop: "1px solid #e5e7eb",
  paddingTop: "20px",
};
