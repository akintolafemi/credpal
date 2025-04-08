export enum EventType {
  AUDIT_LOG = 'audit.log',
  SEND_EMAIL = 'email.send',
  SEND_OTP = 'otp.send',
  ACCOUNT_VERIFIED = 'account.verified',
}

export enum AuditActionType {
  AUTHENTICATION_SUCCESS = 'user authenticated successfully',
}

export type event = (typeof EventType)[keyof typeof EventType];

export enum NotificationType {
  SIGN_UP = 'user.registered',
  VERIFY_ACCOUNT = 'account.verify',
}

export type EmailNotificationData = {
  type: NotificationType;
  email: string;
  code?: string;
};

export type SendAccountVerificationData = {
  email: string;
};
