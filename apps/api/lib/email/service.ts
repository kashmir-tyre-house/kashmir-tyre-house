import { createElement, type ComponentType } from "react";
import { render } from "@react-email/render";
import {
  Resend,
  type Attachment,
  type CreateEmailRequestOptions,
  type CreateEmailResponseSuccess,
  type Tag
} from "resend";

type EmailRecipient = string | string[];

type EmailBaseOptions = {
  from?: string;
  to: EmailRecipient;
  subject: string;
  bcc?: EmailRecipient;
  cc?: EmailRecipient;
  headers?: Record<string, string>;
  replyTo?: EmailRecipient;
  tags?: Tag[];
};

type SendTextEmailOptions = EmailBaseOptions & {
  message: string;
  attachments?: Attachment[];
};

type SendTemplateEmailOptions<TTemplateProps extends Record<string, unknown>> =
  EmailBaseOptions & {
    attachments?: Attachment[];
    template: ComponentType<TTemplateProps>;
    templateProps: TTemplateProps;
    text?: string;
  };

type EmailSendResult = {
  id: string;
};

let resendClient: Resend | null = null;

export class EmailServiceError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly cause?: unknown
  ) {
    super(message);
    this.name = "EmailServiceError";
  }
}

export async function sendTextEmail({
  attachments,
  bcc,
  cc,
  from,
  headers,
  message,
  replyTo,
  subject,
  tags,
  to
}: SendTextEmailOptions): Promise<EmailSendResult> {
  const response = await getResendClient().emails.send({
    attachments,
    bcc: normalizeRecipients(bcc),
    cc: normalizeRecipients(cc),
    from: resolveSender(from),
    headers,
    replyTo: normalizeRecipients(replyTo),
    subject,
    tags,
    text: message,
    to: normalizeRequiredRecipients(to)
  });

  return handleResendResponse(response);
}

export async function sendTemplateEmail<
  TTemplateProps extends Record<string, unknown>
>(
  {
    attachments,
    bcc,
    cc,
    from,
    headers,
    replyTo,
    subject,
    tags,
    template,
    templateProps,
    text,
    to
  }: SendTemplateEmailOptions<TTemplateProps>,
  requestOptions?: CreateEmailRequestOptions
): Promise<EmailSendResult> {
  const email = createElement(template, templateProps);
  const html = await render(email, { pretty: true });
  const plainText = text ?? (await render(email, { plainText: true }));
  const response = await getResendClient().emails.send(
    {
      attachments,
      bcc: normalizeRecipients(bcc),
      cc: normalizeRecipients(cc),
      from: resolveSender(from),
      headers,
      html,
      replyTo: normalizeRecipients(replyTo),
      subject,
      tags,
      text: plainText,
      to: normalizeRequiredRecipients(to)
    },
    requestOptions
  );

  return handleResendResponse(response);
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new EmailServiceError(
      "RESEND_API_KEY is not configured",
      "EMAIL_CONFIG_MISSING"
    );
  }

  resendClient ??= new Resend(apiKey);

  return resendClient;
}

function resolveSender(from?: string) {
  const sender = from ?? process.env.EMAIL_FROM;

  if (!sender) {
    throw new EmailServiceError(
      "Email sender is not configured",
      "EMAIL_SENDER_MISSING"
    );
  }

  return sender;
}

function normalizeRecipients(recipients?: EmailRecipient) {
  if (!recipients) {
    return undefined;
  }

  return normalizeRequiredRecipients(recipients);
}

function normalizeRequiredRecipients(recipients: EmailRecipient) {
  const normalizedRecipients = Array.isArray(recipients)
    ? recipients.map((recipient) => recipient.trim()).filter(Boolean)
    : recipients.trim();

  if (Array.isArray(normalizedRecipients) && normalizedRecipients.length === 0) {
    throw new EmailServiceError(
      "At least one recipient is required",
      "EMAIL_RECIPIENT_MISSING"
    );
  }

  if (!Array.isArray(normalizedRecipients) && !normalizedRecipients) {
    throw new EmailServiceError(
      "At least one recipient is required",
      "EMAIL_RECIPIENT_MISSING"
    );
  }

  return normalizedRecipients;
}

function handleResendResponse(response: {
  data: CreateEmailResponseSuccess | null;
  error: { message: string; name: string; statusCode: number | null } | null;
}) {
  if (response.error) {
    throw new EmailServiceError(
      response.error.message,
      response.error.name,
      response.error
    );
  }

  if (!response.data?.id) {
    throw new EmailServiceError(
      "Resend did not return an email id",
      "EMAIL_SEND_UNKNOWN"
    );
  }

  return { id: response.data.id };
}
