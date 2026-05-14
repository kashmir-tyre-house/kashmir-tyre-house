import { Text } from "@react-email/components";

import { BaseEmail } from "./base-email";

export type PlainMessageEmailProps = {
  message: string;
  preview?: string;
  title: string;
};

export function PlainMessageEmail({
  message,
  preview,
  title
}: PlainMessageEmailProps) {
  return (
    <BaseEmail preview={preview ?? title} title={title}>
      <Text style={messageStyle}>{message}</Text>
    </BaseEmail>
  );
}

const messageStyle = {
  color: "#6f6258",
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0",
  whiteSpace: "pre-line"
};
