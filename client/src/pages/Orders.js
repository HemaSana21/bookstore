import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import ConfirmDialog from '../components/ConfirmDialog';

const STATUS_STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const highlight = searchParams.get('highlight');
  const [cancelTargetId, setCancelTargetId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data.orders);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (reason) => {
    setCancelling(true);
    try {
      await api.put(`/orders/${cancelTargetId}/cancel`, { reason });
      toast.success('Order cancelled');
      setCancelTargetId(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const printInvoice = (order) => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Invoice - ${order._id}</title></head>
      <body style="font-family: Arial, sans-serif; padding: 24px;">
        <h2>BookStore Invoice</h2>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <hr/>
        <table width="100%" cellpadding="6" style="border-collapse:collapse;">
          <tr><th align="left">Item</th><th align="right">Qty</th><th align="right">Price</th></tr>
          ${order.items.map((i) => `<tr><td>${i.title}</td><td align="right">${i.quantity}</td><td align="right">₹${i.price}</td></tr>`).join('')}
        </table>
        <hr/>
        <p>Subtotal: ₹${order.subtotal}</p>
        <p>Discount: -₹${order.discount}</p>
        <p>GST: ₹${order.gst}</p>
        <p>Delivery: ₹${order.deliveryCharge}</p>
        <h3>Grand Total: ₹${order.grandTotal}</h3>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  if (loading) return <p className="page-loader">Loading orders...</p>;

  return (
    <div className="orders-page">
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-blob blob-1"></div>
          <div className="empty-state-blob blob-2"></div>
          <div className="empty-state-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z"
                stroke="#FFFFFF"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M3 8.5V16l9 4.5 9-4.5V8.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M12 13v7.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <h3>No orders yet</h3>
          <p>Once you place an order, you'll be able to track it, view invoices, and see delivery updates here.</p>
          <Link to="/books" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order._id} className={`order-card ${highlight === order._id ? 'highlighted' : ''}`}>
            <div className="order-header">
              <div>
                <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
                <p>{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`status-badge status-${order.status.toLowerCase()}`}>{order.status}</span>
            </div>

            {order.status !== 'Cancelled' && (
              <div className="tracking-steps">
                {STATUS_STEPS.map((step, idx) => (
                  <div key={step} className={`step ${STATUS_STEPS.indexOf(order.status) >= idx ? 'active' : ''}`}>
                    {step}
                  </div>
                ))}
              </div>
            )}

            <div className="order-items">
              {order.items.map((item) => (
                <div key={item.book} className="order-item-row">
                  <span>{item.title} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <strong>Total: ₹{order.grandTotal}</strong>
              <div className="order-actions">
                <button onClick={() => printInvoice(order)}>Invoice</button>
                {['Pending', 'Processing'].includes(order.status) && (
                  <button className="link-btn" onClick={() => setCancelTargetId(order._id)}>Cancel Order</button>
                )}
              </div>
            </div>
          </div>
        ))
      )}

      <ConfirmDialog
        open={!!cancelTargetId}
        title="Cancel this order?"
        message="This action can't be undone. Please let us know why you're cancelling so we can improve."
        confirmLabel="Cancel Order"
        cancelLabel="Keep Order"
        requireReason
        reasonLabel="Reason for cancellation"
        reasonPlaceholder="e.g. Ordered by mistake, found a better price..."
        danger
        loading={cancelling}
        onConfirm={handleCancel}
        onClose={() => setCancelTargetId(null)}
      />
    </div>
  );
};

export default Orders;