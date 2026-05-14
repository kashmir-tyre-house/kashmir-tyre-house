export {
  EmailServiceError,
  sendTemplateEmail,
  sendTextEmail
} from "./service";
export { BaseEmail } from "./templates/base-email";
export {
  EnquiryEmail,
  type EnquiryEmailProps
} from "./templates/enquiry-email";
export {
  ForgotPasswordEmail,
  type ForgotPasswordEmailProps
} from "./templates/forgot-password-email";
export {
  PlainMessageEmail,
  type PlainMessageEmailProps
} from "./templates/plain-message-email";
