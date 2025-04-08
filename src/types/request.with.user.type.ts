import { Users } from '@entities/user.entity';

type User = {
  user: Users & {
    token?: string;
  };
};

type RequestWithUser = Request & User;

export default RequestWithUser;

export enum AccountType {
  user = 'user',
  sysadmin = 'sysadmin',
}

export const AccountTypes = [AccountType.sysadmin, AccountType.user];
