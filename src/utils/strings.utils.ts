export const generateOTP = (len = 4) => {
  const min = Math.pow(10, len - 1);
  const max = Math.pow(10, len) - 1;
  // Generate a random number between min and max (inclusive)
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  return Number(otp);
};

export const generateWalletNumber = () => {
  const min = 1000000000; // Minimum 10-digit number (1 followed by 9 zeros)
  const max = 9999999999; // Maximum 10-digit number (9 nines)

  // Generate a random number between min and max (inclusive)
  const walletNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  // Convert the number to a string and return it
  return walletNumber.toString();
};
