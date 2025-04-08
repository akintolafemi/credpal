export enum WalletActionTypes {
  FUND_WALLET = 'wallet.fund',
}

export type FundWalletType = {
  subWalletId: number;
  fromWalletNumber: string;
  amount: number;
  transactionType: TransactionType;
};

export enum TransactionStatus {
  success = 'success',
  failed = 'failed',
  pending = 'pending',
}

export const TransactionStatusTypes = [
  TransactionStatus.failed,
  TransactionStatus.pending,
  TransactionStatus.success,
];

export enum TransactionType {
  fund = 'fund',
  conversion = 'conversion',
  trade = 'trade',
}

export const TransactionTypes = [
  TransactionType.fund,
  TransactionType.conversion,
  TransactionType.trade,
];
