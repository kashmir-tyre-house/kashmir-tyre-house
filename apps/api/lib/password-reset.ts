import {
  adminPasswordResetTokens,
  adminUsers,
  getDb
} from "@kth/db";
import { and, desc, eq, gt, isNotNull, isNull, lt, sql } from "drizzle-orm";
import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

import { sendTemplateEmail } from "./email/service";
import { ForgotPasswordEmail } from "./email/templates/forgot-password-email";
import { hashPassword } from "./password";

const RESET_CODE_LENGTH = 6;
const RESET_CODE_EXPIRY_MINUTES = 15;
const MAX_CODE_ATTEMPTS = 5;

type AdminUserForReset = {
  id: string;
  name: string | null;
  email: string;
};

export type RequestPasswordResetResult = {
  adminExists: boolean;
  emailSent: boolean;
};

export async function requestPasswordReset(
  rawEmail: string
): Promise<RequestPasswordResetResult> {
  const email = normalizeEmail(rawEmail);
  const adminUser = await getActiveAdminUserByEmail(email);

  if (!adminUser) {
    return { adminExists: false, emailSent: false };
  }

  const db = getDb();
  const now = new Date();
  const code = generateResetCode();
  const expiresAt = new Date(
    now.getTime() + RESET_CODE_EXPIRY_MINUTES * 60 * 1000
  );

  await db
    .delete(adminPasswordResetTokens)
    .where(lt(adminPasswordResetTokens.expiresAt, now));

  await db
    .update(adminPasswordResetTokens)
    .set({ usedAt: now })
    .where(
      and(
        eq(adminPasswordResetTokens.adminUserId, adminUser.id),
        isNull(adminPasswordResetTokens.usedAt)
      )
    );

  await db.insert(adminPasswordResetTokens).values({
    adminUserId: adminUser.id,
    codeHash: hashResetSecret(code),
    expiresAt
  });

  await sendTemplateEmail({
    subject: "Your Kashmir Tyre House admin reset code",
    template: ForgotPasswordEmail,
    templateProps: {
      code,
      expiresInMinutes: RESET_CODE_EXPIRY_MINUTES,
      name: adminUser.name ?? undefined,
    },
    to: adminUser.email
  });

  return { adminExists: true, emailSent: true };
}

export async function verifyPasswordResetCode(rawEmail: string, code: string) {
  const email = normalizeEmail(rawEmail);
  const adminUser = await getActiveAdminUserByEmail(email);

  if (!adminUser) {
    return { ok: false, resetToken: null };
  }

  const db = getDb();
  const now = new Date();
  const token = await getLatestUsableResetToken(adminUser.id, now);

  if (!token) {
    return { ok: false, resetToken: null };
  }

  if (token.attempts >= MAX_CODE_ATTEMPTS) {
    await markResetTokenUsed(token.id, now);
    return { ok: false, resetToken: null };
  }

  if (!safeHashEquals(hashResetSecret(code), token.codeHash)) {
    await db
      .update(adminPasswordResetTokens)
      .set({ attempts: token.attempts + 1 })
      .where(eq(adminPasswordResetTokens.id, token.id));

    return { ok: false, resetToken: null };
  }

  const resetToken = generateResetToken();

  await db
    .update(adminPasswordResetTokens)
    .set({
      resetTokenHash: hashResetSecret(resetToken),
      verifiedAt: now
    })
    .where(eq(adminPasswordResetTokens.id, token.id));

  return { ok: true, resetToken };
}

export async function resetAdminPassword({
  email: rawEmail,
  password,
  resetToken
}: {
  email: string;
  password: string;
  resetToken: string;
}) {
  const email = normalizeEmail(rawEmail);
  const adminUser = await getActiveAdminUserByEmail(email);

  if (!adminUser) {
    return false;
  }

  const db = getDb();
  const now = new Date();
  const resetTokenHash = hashResetSecret(resetToken);
  const [passwordResetToken] = await db
    .select({ id: adminPasswordResetTokens.id })
    .from(adminPasswordResetTokens)
    .where(
      and(
        eq(adminPasswordResetTokens.adminUserId, adminUser.id),
        eq(adminPasswordResetTokens.resetTokenHash, resetTokenHash),
        isNotNull(adminPasswordResetTokens.verifiedAt),
        isNull(adminPasswordResetTokens.usedAt),
        gt(adminPasswordResetTokens.expiresAt, now)
      )
    )
    .limit(1);

  if (!passwordResetToken) {
    return false;
  }

  const passwordHash = await hashPassword(password);

  await db
    .update(adminUsers)
    .set({ passwordHash, updatedAt: now })
    .where(eq(adminUsers.id, adminUser.id));

  await markResetTokenUsed(passwordResetToken.id, now);

  return true;
}

async function getActiveAdminUserByEmail(email: string) {
  const [adminUser] = await getDb()
    .select({
      id: adminUsers.id,
      name: adminUsers.name,
      email: adminUsers.email
    })
    .from(adminUsers)
    .where(
      and(eq(adminUsers.isActive, true), sql`lower(${adminUsers.email}) = ${email}`)
    )
    .limit(1);

  return (adminUser ?? null) satisfies AdminUserForReset | null;
}

async function getLatestUsableResetToken(adminUserId: string, now: Date) {
  const [token] = await getDb()
    .select({
      id: adminPasswordResetTokens.id,
      attempts: adminPasswordResetTokens.attempts,
      codeHash: adminPasswordResetTokens.codeHash
    })
    .from(adminPasswordResetTokens)
    .where(
      and(
        eq(adminPasswordResetTokens.adminUserId, adminUserId),
        isNull(adminPasswordResetTokens.usedAt),
        gt(adminPasswordResetTokens.expiresAt, now)
      )
    )
    .orderBy(desc(adminPasswordResetTokens.createdAt))
    .limit(1);

  return token ?? null;
}

async function markResetTokenUsed(id: string, usedAt: Date) {
  await getDb()
    .update(adminPasswordResetTokens)
    .set({ usedAt })
    .where(eq(adminPasswordResetTokens.id, id));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function generateResetCode() {
  return randomInt(0, 10 ** RESET_CODE_LENGTH)
    .toString()
    .padStart(RESET_CODE_LENGTH, "0");
}

function generateResetToken() {
  return randomBytes(32).toString("base64url");
}

function hashResetSecret(value: string) {
  return createHash("sha256")
    .update(`${value}:${getResetPepper()}`)
    .digest("hex");
}

function getResetPepper() {
  const secret = process.env.ADMIN_PASSWORD_RESET_SECRET ?? process.env.AUTH_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV === "development") {
    return "kth-admin-local-password-reset-secret";
  }

  throw new Error("ADMIN_PASSWORD_RESET_SECRET or AUTH_SECRET is required");
}

function safeHashEquals(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(left), Buffer.from(right));
}
