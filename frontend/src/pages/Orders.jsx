import { useEffect, useState } from "react";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [sortOrder, setSortOrder] = useState("newToOld");

  useEffect(() => {
    const savedOrders =
      JSON.parse(localStorage.getItem("orders")) || [];
    setOrders(savedOrders);
  }, []);

  // Sort orders based on date
  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === "newToOld" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ borderLeft: '4px solid var(--color-primary)', paddingLeft: '16px', margin: 0 }}>📦 My Orders</h1>
        
        {orders.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>🔍 Sort By:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{
                fontFamily: 'var(--font-sans)',
                background: 'var(--bg-glass-input)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="newToOld">🆕 Newest to Oldest</option>
              <option value="oldToNew">⏳ Oldest to Newest</option>
            </select>
          </div>
        )}
      </div>

      {sortedOrders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>📭 No purchase history found.</p>
        </div>
      ) : (
        sortedOrders.map((order, index) => (
          <div
            key={order.id || index}
            className="glass-panel"
            style={{
              padding: "24px",
              marginBottom: "20px",
              textAlign: "left"
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>🛍️ Order #{order.id || `MOCK-${index + 1}`}</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {new Date(order.date).toLocaleString()}
              </span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                <strong>💳 Payment Method:</strong> <span style={{ textTransform: 'uppercase', color: 'var(--text-primary)' }}>{order.paymentMethod || 'Razorpay (Demo)'}</span>
              </p>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>🏷️ Products</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "center"
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    width="64"
                    height="64"
                    style={{ borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-glass)' }}
                  />

                  <div>
                    <h5 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{item.name}</h5>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', margin: '4px 0 0 0', fontWeight: 'bold' }}>₹ {item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-glass)', marginTop: '20px', paddingTop: '16px', fontWeight: 'bold' }}>
              <span>💰 Total Paid:</span>
              <span style={{ color: 'var(--color-secondary)', fontSize: '1.15rem' }}>₹ {order.total}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Orders;