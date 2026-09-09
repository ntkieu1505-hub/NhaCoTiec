export interface PaymentSettings {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  transferSyntax: string;
  qrImageUrl: string;
  paymentNote: string;
  isActive: boolean;
  updatedAt: string;
}
