export function getRentOutItemQuantityInfo(rentOutItem: {
  quantity: number;
  returnItems: {
    quantity: number;
  }[];
}) {
  const returnedQuantity = rentOutItem.returnItems.reduce((sum, item) => sum + item.quantity, 0);
  return {
    returnedQuantity,
    remainingQuantity: rentOutItem.quantity - returnedQuantity,
  };
}

export function getRentOutPaymentInfo(rentOut: {
  rentReturns: { totalAmount: number }[];
  rentPayments: { totalAmount: number }[];
}) {
  const totalAmount = rentOut.rentReturns.reduce(
    (sum, returnItem) => sum + returnItem.totalAmount,
    0,
  );
  const paidAmount = rentOut.rentPayments.reduce(
    (sum, paymentItem) => sum + paymentItem.totalAmount,
    0,
  );

  const pendingAmount = totalAmount - paidAmount;

  return {
    totalAmount,
    paidAmount,
    pendingAmount: pendingAmount < 0 ? 0 : pendingAmount,
  };
}
