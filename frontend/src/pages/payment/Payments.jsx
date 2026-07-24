import { useState, useEffect } from 'react';
import { paymentApi } from '../../api/payment.api.js';
import { courseApi } from '../../api/course.api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Button } from '../../components/common/Button.jsx';
import './Payment.css';

export const Payments = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, paymentRes] = await Promise.all([
          courseApi.getAll({}), // Get all courses to show purchase options
          paymentApi.getMyPayments()
        ]);
        
        // Filter out courses the student is already enrolled in
        const enrolledIds = new Set(paymentRes.data.map(p => p.course._id));
        const availableCourses = courseRes.data.filter(c => !enrolledIds.has(c._id));

        setCourses(availableCourses);
        setPayments(paymentRes.data);
      } catch (err) {
        console.error('Failed to load payment data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (course) => {
    setProcessingId(course._id);
    
    const res = await loadRazorpay();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setProcessingId(null);
      return;
    }

    try {
      // 1. Create order on backend
      const orderRes = await paymentApi.createOrder(course._id);
      const { orderId, amount, currency, keyId } = orderRes.data;

      // 2. Setup Razorpay options
      const options = {
        key: keyId,
        amount: amount.toString(),
        currency: currency,
        name: 'Student Management System',
        description: `Enrollment Fee for ${course.name}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            // 3. Verify payment on backend
            await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            alert('Payment successful! You are now enrolled.');
            window.location.reload(); // Quick refresh to update state
          } catch (err) {
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#4F46E5',
        },
      };

      // 4. Open Razorpay Checkout
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initialize payment.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="page-container"><div className="loading">Loading...</div></div>;

  return (
    <div className="payment-page">
      <div className="page-header">
        <h1 className="page-title">Fee Payments</h1>
      </div>

      <div className="payment-section">
        <h2 className="section-title">Available Courses</h2>
        <div className="course-grid">
          {courses.length === 0 ? (
            <div className="empty-state">No new courses available to enroll.</div>
          ) : (
            courses.map(course => (
              <div key={course._id} className="payment-course-card">
                <h3>{course.name}</h3>
                <p>{course.description || 'No description.'}</p>
                <div className="price-tag">₹1000</div>
                <Button 
                  variant="primary" 
                  onClick={() => handlePayment(course)}
                  disabled={processingId === course._id}
                >
                  {processingId === course._id ? 'Processing...' : 'Pay & Enroll'}
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="payment-section mt-xl">
        <h2 className="section-title">Payment History</h2>
        <div className="card table-container">
          {payments.length === 0 ? (
            <div className="empty-state">No successful payments found.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Course</th>
                  <th>Amount</th>
                  <th>Order ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment._id}>
                    <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td>{payment.course?.name || '-'}</td>
                    <td>₹{payment.amount}</td>
                    <td><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)'}}>{payment.razorpayOrderId}</span></td>
                    <td><span className="status-badge status-paid">Successful</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
