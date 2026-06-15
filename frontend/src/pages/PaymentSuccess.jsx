function PaymentSuccess() {
  return (
    <div className="success-container" id="payment-success-page">
      <div className="success-icon">✓</div>
      <h1>Order Placed Successfully!</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
        Thank you for your purchase. Your payment was processed successfully.
      </p>
    </div>
  )
}

export default PaymentSuccess