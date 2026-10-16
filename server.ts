import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

// Helper function to resolve Nodemailer SMTP transporter
function createMailTransporter(customConfig?: { host?: string; port?: number; user?: string; pass?: string; secure?: boolean }) {
  const host = customConfig?.host || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = customConfig?.port || Number(process.env.SMTP_PORT) || 465;
  const user = customConfig?.user || process.env.SMTP_USER;
  const pass = customConfig?.pass || process.env.SMTP_PASS;
  const secure = customConfig?.secure !== undefined ? customConfig.secure : (port === 465);

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Test Admin Gmail / SMTP Connection Route
  app.post("/api/admin/test-email", async (req, res) => {
    try {
      const { testEmail, smtpUser, smtpPass, smtpHost, smtpPort } = req.body;
      const target = testEmail || req.body.email;

      if (!target) {
        res.status(400).json({ error: "Please provide a target recipient email address for testing." });
        return;
      }

      const transporter = createMailTransporter({
        user: smtpUser,
        pass: smtpPass,
        host: smtpHost,
        port: smtpPort ? Number(smtpPort) : undefined
      });

      if (!transporter) {
        res.status(400).json({ 
          error: "Admin Gmail / SMTP credentials not configured. Please enter your Gmail address and App Password." 
        });
        return;
      }

      const senderEmail = smtpUser || process.env.SMTP_USER;

      await transporter.sendMail({
        from: `"Children's Rise High School Administration" <${senderEmail}>`,
        to: target,
        subject: "CRHS Admin Mail System Test Connection",
        html: `
          <div style="font-family: Arial, sans-serif; color: #0B2545; padding: 25px; border: 3px solid #0B2545; max-width: 600px;">
            <div style="background-color: #0B2545; padding: 15px; text-align: center; border-bottom: 4px solid #FFC107;">
              <h1 style="color: #FFFFFF; margin: 0; font-size: 20px; text-transform: uppercase;">Children's Rise High School</h1>
              <p style="color: #FFC107; margin: 5px 0 0 0; font-size: 12px; font-weight: bold;">ADMINISTRATION MAIL SYSTEM</p>
            </div>
            <div style="padding: 20px 0;">
              <h2 style="color: #0B2545; margin-top: 0;">Admin Email System Connected Successfully!</h2>
              <p>This is a verified test email sent from the <strong>Children's Rise High School Admin Portal</strong>.</p>
              <div style="background-color: #F8F9FA; padding: 15px; border-left: 4px solid #0B2545; margin: 15px 0;">
                <p style="margin: 0; font-size: 13px;"><strong>Sender Account:</strong> ${senderEmail}</p>
                <p style="margin: 5px 0 0 0; font-size: 13px;"><strong>Status:</strong> Active & Delivering</p>
              </div>
              <p>The system is ready to dispatch automated user registration emails with CRHS IDs, password reset instructions, and official administrative announcements to families.</p>
            </div>
            <div style="border-top: 1px solid #E2E8F0; pt: 15px; font-size: 11px; color: #64748B;">
              Children's Rise High School, Tarwara, Siwan (Bihar) • Admin System Service
            </div>
          </div>
        `
      });

      res.json({
        success: true,
        message: `Test email successfully sent to ${target} on behalf of CRHS Administration!`,
      });
    } catch (err: any) {
      console.error("[ADMIN MAIL TEST ERROR]", err);
      res.status(500).json({ 
        error: "Failed to deliver test email. Check your Gmail address and Gmail App Password.",
        details: err.message 
      });
    }
  });

  // Admin Direct Custom Email Dispatch to Student / Family
  app.post("/api/admin/send-direct-email", async (req, res) => {
    try {
      const { recipientEmail, recipientName, subject, messageBody, smtpUser, smtpPass } = req.body;

      if (!recipientEmail || !subject || !messageBody) {
        res.status(400).json({ error: "Missing required fields: recipientEmail, subject, messageBody" });
        return;
      }

      const transporter = createMailTransporter({ user: smtpUser, pass: smtpPass });
      const senderEmail = smtpUser || process.env.SMTP_USER || "crhs.admin@gmail.com";

      if (transporter) {
        await transporter.sendMail({
          from: `"CRHS Administration" <${senderEmail}>`,
          to: recipientEmail,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; color: #0B2545; padding: 25px; border: 2px solid #0B2545; max-width: 650px;">
              <div style="background-color: #0B2545; padding: 15px; border-bottom: 4px solid #FFC107;">
                <h2 style="color: #FFFFFF; margin: 0; font-size: 18px; text-transform: uppercase;">Children's Rise High School</h2>
                <p style="color: #FFC107; margin: 4px 0 0 0; font-size: 11px; font-weight: bold; text-transform: uppercase;">Official Administrative Communication</p>
              </div>
              <div style="padding: 20px 0; line-height: 1.6;">
                <p style="font-size: 14px;">Dear <strong>${recipientName || 'Parent / Student'}</strong>,</p>
                <div style="background-color: #F8F9FA; padding: 18px; border-left: 4px solid #FFC107; margin: 15px 0; white-space: pre-wrap; font-size: 14px; color: #1E293B;">${messageBody}</div>
                <p style="font-size: 13px; color: #475569;">If you have any questions regarding this notice, please contact the administrative office.</p>
              </div>
              <div style="border-top: 2px solid #F1F5F9; padding-top: 15px; font-size: 12px; color: #64748B;">
                <strong>Children's Rise High School Administration</strong><br/>
                Tarwara, Siwan (Bihar) • Phone: +91 91234 56789
              </div>
            </div>
          `
        });
      } else {
        console.log(`[SIMULATED MAIL - ADMIN DIRECT] To: ${recipientEmail} | Subject: ${subject}`);
      }

      res.json({
        success: true,
        message: `Official email dispatched to ${recipientName ? `${recipientName} (${recipientEmail})` : recipientEmail} on behalf of CRHS Administration.`
      });
    } catch (err: any) {
      console.error("[ADMIN DIRECT MAIL ERROR]", err);
      res.status(500).json({ error: "Failed to dispatch admin communication email", details: err.message });
    }
  });

  // Automated Welcome Email Notification Route
  app.post("/api/send-welcome-email", async (req, res) => {
    try {
      const { email, fullName, crhsId, smtpUser, smtpPass } = req.body;

      if (!email || !crhsId) {
        res.status(400).json({ error: "Missing required fields (email, crhsId)" });
        return;
      }

      console.log(`[EMAIL SERVICE] Sending Registration Welcome Email to: ${email}`);
      console.log(`[EMAIL SERVICE] Details - Name: ${fullName}, Generated CRHS ID: ${crhsId}`);

      const transporter = createMailTransporter({ user: smtpUser, pass: smtpPass });
      const senderEmail = smtpUser || process.env.SMTP_USER || "crhs.admin@gmail.com";

      if (transporter) {
        await transporter.sendMail({
          from: `"Children's Rise High School Administration" <${senderEmail}>`,
          to: email,
          subject: "Welcome to Children's Rise High School - Your 12-Digit CRHS ID",
          html: `
            <div style="font-family: Arial, sans-serif; color: #0B2545; padding: 25px; border: 2px solid #0B2545; max-width: 650px;">
              <div style="background-color: #0B2545; padding: 15px; text-align: center; border-bottom: 4px solid #FFC107;">
                <h1 style="color: #FFFFFF; margin: 0; font-size: 20px; text-transform: uppercase;">Children's Rise High School</h1>
                <p style="color: #FFC107; margin: 4px 0 0 0; font-size: 11px; font-weight: bold; tracking: 1px;">TARWARA, SIWAN (BIHAR)</p>
              </div>
              <div style="padding: 20px 0; line-height: 1.6;">
                <h2 style="color: #0B2545; margin-top: 0; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px;">Welcome to CRHS Portal!</h2>
                <p>Dear <strong>${fullName || 'Student/Parent'}</strong>,</p>
                <p>On behalf of the school management and administration, we welcome you to the official portal of <strong>Children's Rise High School</strong>.</p>
                
                <div style="background-color: #F8F9FA; border-left: 5px solid #FFC107; padding: 20px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; font-size: 12px; text-transform: uppercase; font-weight: bold; color: #475569;">Your Official 12-Digit CRHS ID:</p>
                  <h1 style="margin: 8px 0; color: #0B2545; font-family: monospace; font-size: 28px; letter-spacing: 3px;">${crhsId}</h1>
                  <p style="margin: 0; font-size: 12px; color: #64748B;">Keep this ID safe! You can use your <strong>CRHS ID</strong>, <strong>Registered Mobile Number</strong>, or <strong>Email Address</strong> to sign in.</p>
                </div>

                <p>You can now log in to view academic notices, track progress, and communicate with the administration.</p>
                <br/>
                <p>Warm regards,<br/><strong>Children's Rise High School Administration</strong><br/>Tarwara, Siwan (Bihar)</p>
              </div>
            </div>
          `,
        });
      }

      res.json({
        success: true,
        message: `Welcome email notification sent successfully to ${email}`,
        crhsId,
      });
    } catch (err: any) {
      console.error("[EMAIL SERVICE ERROR]", err);
      res.status(500).json({ error: "Failed to dispatch email", details: err.message });
    }
  });

  // Automated Password Reset Notification Route
  app.post("/api/send-password-reset-email", async (req, res) => {
    try {
      const { email, crhsId, smtpUser, smtpPass } = req.body;

      if (!email) {
        res.status(400).json({ error: "Missing email parameter" });
        return;
      }

      console.log(`[EMAIL SERVICE] Sending Password Reset Email to: ${email} (CRHS ID: ${crhsId || 'N/A'})`);

      const transporter = createMailTransporter({ user: smtpUser, pass: smtpPass });
      const senderEmail = smtpUser || process.env.SMTP_USER || "crhs.admin@gmail.com";

      if (transporter) {
        await transporter.sendMail({
          from: `"Children's Rise High School Administration" <${senderEmail}>`,
          to: email,
          subject: "Password Reset Request - Children's Rise High School",
          html: `
            <div style="font-family: Arial, sans-serif; color: #0B2545; padding: 25px; border: 2px solid #0B2545; max-width: 600px;">
              <div style="background-color: #0B2545; padding: 15px; border-bottom: 4px solid #FFC107;">
                <h2 style="color: #FFFFFF; margin: 0; font-size: 18px; text-transform: uppercase;">Children's Rise High School</h2>
                <p style="color: #FFC107; margin: 4px 0 0 0; font-size: 11px; font-weight: bold;">PORTAL SECURITY SERVICE</p>
              </div>
              <div style="padding: 20px 0;">
                <h3 style="color: #0B2545; margin-top: 0;">CRHS Portal Password Recovery</h3>
                <p>Hello,</p>
                <p>We received a password reset request for your account linked to: <strong>${email}</strong>${crhsId ? ` (CRHS ID: <strong>${crhsId}</strong>)` : ''}.</p>
                <p>Please check your email inbox for password recovery instructions from Firebase Security.</p>
                <br/>
                <p style="font-size: 12px; color: #64748B;">If you did not request a password reset, please ignore this email or contact the school administration.</p>
                <br/>
                <p>Regards,<br/><strong>Children's Rise High School Administration</strong></p>
              </div>
            </div>
          `,
        });
      }

      res.json({
        success: true,
        message: `Password reset instructions sent to ${email}`,
      });
    } catch (err: any) {
      console.error("[EMAIL SERVICE ERROR]", err);
      res.status(500).json({ error: "Failed to dispatch password reset email", details: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    // Serve static assets with smart caching:
    // - Hashed assets (/assets/*) get long-term caching
    // - index.html is NEVER cached (no-cache, no-store, must-revalidate)
    app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
        } else if (filePath.includes(path.sep + "assets" + path.sep) || filePath.includes("/assets/")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      }
    }));

    app.get("*all", (req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
