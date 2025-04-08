import axios from 'axios';

export const fetchFXRates = async (currency: string) => {
  try {
    const response = await axios({
      url: `${process.env.EXCHANGE_RATE_API_URL}/${process.env.EXCHANGE_RATE_API_KEY}/latest/${currency}`,
      method: 'GET',
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return error?.response?.data;
  }
};
