export async function createPayment(paymentData) {
  return {
    success: true,
    paymentId:
      "PAY" + Math.floor(Math.random() * 900000 + 100000),
    ...paymentData,
  };
}