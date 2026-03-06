/**
 * L-05: Structured logger with log levels and PII redaction.
 * Production defaults to "warn" level; development uses "debug" with pretty output.
 * Usage: LOG_LEVEL=debug npm run dev
 */
import pino from "pino";

const LOG_LEVEL =
  (process.env.LOG_LEVEL?.toLowerCase() as pino.Level) || (process.env.NODE_ENV === "production" ? "warn" : "debug");

const redactPaths = [
  "email", "*.email", "**.email",
  "identifier", "*.identifier",
  "token", "*.token", "**.token",
  "password", "*.password", "**.password",
  "secret", "*.secret", "**.secret",
  "apiKey", "*.apiKey",
  "authorization", "*.authorization", "req.headers.authorization", "req.headers.cookie",
  "verificationToken", "recipientEmail",
];

export const logger = pino({
  level: LOG_LEVEL,
  redact: {
    paths: redactPaths,
    censor: "[REDACTED]",
  },
  ...(process.env.NODE_ENV !== "production"
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }
    : {}),
});

export default logger;
