import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Lock, 
  Mail, 
  Smartphone, 
  Building2, 
  Wallet, 
  Hotel, 
  Utensils, 
  Car, 
  Ticket, 
  ShoppingBag, 
  MoreHorizontal, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink,
  Printer,
  Send 
} from 'lucide-react';
import { api } from '../api';
import { useCurrency } from '../context/CurrencyContext';

const DEFAULT_SPLIT_PERCENTAGES = {
  Accommodation: 35,
  Transport: 25,
  Food: 18,
  Activities: 12,
  Shopping: 7,
  Other: 3
};

const CATEGORY_META = {
  Accommodation: { icon: Hotel, color: '#38bdf8', label: 'Accommodation (Hotels & Stays)' },
  Transport: { icon: Car, color: '#a855f7', label: 'Transport (Flights, Cabs & Trains)' },
  Food: { icon: Utensils, color: '#f43f5e', label: 'Food (Dining, Cafes & Snacks)' },
  Activities: { icon: Ticket, color: '#10b981', label: 'Activities (Tours & Sightseeing)' },
  Shopping: { icon: ShoppingBag, color: '#f59e0b', label: 'Shopping (Souvenirs & Markets)' },
  Other: { icon: MoreHorizontal, color: '#94a3b8', label: 'Other (Insurance, Tips & Misc)' }
};

export default function PaymentModal({ isOpen, onClose, trip, currentUser, onPaymentSuccess }) {
  if (!isOpen || !trip) return null;

  const { formatAmount, currencyInfo } = useCurrency();

  const defaultEmail = currentUser?.email || 'traveler@gmail.com';
  const defaultAmount = trip.budget > 0 ? trip.budget : 75000;

  const [amount, setAmount] = useState(defaultAmount);
  const [recipientEmail, setRecipientEmail] = useState(defaultEmail);
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, Card, NetBanking, Wallet
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [copiedTxn, setCopiedTxn] = useState(false);

  // Form states
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [selectedUpiApp, setSelectedUpiApp] = useState('Google Pay');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8921');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('872');
  const [cardName, setCardName] = useState(currentUser?.name || 'Traveler');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Amazon Pay');

  useEffect(() => {
    if (trip?.budget) {
      setAmount(trip.budget);
    }
    if (currentUser?.email) {
      setRecipientEmail(currentUser.email);
    }
  }, [trip, currentUser]);

  // Compute calculated amounts for each category
  const numAmount = Math.max(100, Math.round(Number(amount) || defaultAmount));
  let runningSum = 0;
  const categoriesList = Object.entries(DEFAULT_SPLIT_PERCENTAGES).map(([cat, pct], idx, arr) => {
    let catAmount;
    if (idx === arr.length - 1) {
      catAmount = numAmount - runningSum;
    } else {
      catAmount = Math.round((numAmount * pct) / 100);
      runningSum += catAmount;
    }
    return {
      name: cat,
      percent: pct,
      amount: catAmount,
      ...CATEGORY_META[cat]
    };
  });

  const handlePay = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const res = await api.payTrip(trip.id, {
        amount: numAmount,
        currency: 'INR',
        paymentMethod: paymentMethod === 'UPI' ? `UPI (${selectedUpiApp})` : paymentMethod,
        recipientEmail: recipientEmail?.trim() || currentUser?.email || '',
        paymentDetails: {
          upiId: paymentMethod === 'UPI' ? upiId : undefined,
          cardLast4: paymentMethod === 'Card' ? cardNumber.slice(-4) : undefined,
          bankName: paymentMethod === 'NetBanking' ? selectedBank : undefined,
          walletName: paymentMethod === 'Wallet' ? selectedWallet : undefined
        }
      });

      setPaymentResult(res);
      if (onPaymentSuccess) {
        onPaymentSuccess(trip.id);
      }
    } catch (err) {
      alert(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTxn = () => {
    if (paymentResult?.transactionId) {
      navigator.clipboard.writeText(paymentResult.transactionId);
      setCopiedTxn(true);
      setTimeout(() => setCopiedTxn(false), 2000);
    }
  };

  const handleOpenGmail = () => {
    if (!paymentResult) return;
    const splitText = (paymentResult.split || [])
      .map(s => `• ${s.category} (${s.percent}%): ₹${Number(s.amount).toLocaleString('en-IN')}`)
      .join('\n');

    const subject = encodeURIComponent(`✈️ TripMate Payment Receipt & Invoice - ${trip.destination} (TXN: ${paymentResult.transactionId})`);
    const body = encodeURIComponent(
      `TripMate Payment Confirmation & Travel Expense Invoice\n` +
      `====================================================\n\n` +
      `Destination: ${trip.destination} (${trip.country || 'Global'})\n` +
      `Trip Title: ${trip.title || trip.destination}\n` +
      `Total Paid: ₹${Number(paymentResult.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n` +
      `Payment Method: ${paymentResult.paymentMethod}\n` +
      `Transaction ID: ${paymentResult.transactionId}\n` +
      `Date: ${new Date().toLocaleString('en-IN')}\n\n` +
      `Itemized Expenses by Category Split:\n` +
      `------------------------------------\n` +
      `${splitText}\n\n` +
      `Total Budget Allocation: 100% (₹${Number(paymentResult.amount).toLocaleString('en-IN')})\n\n` +
      `View Official Digital Invoice:\n` +
      `http://localhost:5000/api/receipts/${paymentResult.transactionId}\n\n` +
      `---\nTripMate Smart Travel Companion`
    );

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(paymentResult.emailSentTo)}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  };

  const handlePrint = () => {
    if (!paymentResult?.transactionId) return;
    const url = `http://localhost:5000/api/receipts/${paymentResult.transactionId}`;
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-modal-content" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="payment-icon-badge">
              <Lock size={16} className="text-cyan" />
            </div>
            <div>
              <h3>Secure Trip Payment & Auto-Split</h3>
              <p className="modal-subtitle">Pay for {trip.destination} • Split into 6 categories & receive email invoice</p>
            </div>
          </div>
          <button className="btn-icon btn-ghost" onClick={onClose}>✕</button>
        </div>

        {/* If payment completed successfully: Show Receipt */}
        {paymentResult ? (
          <div className="payment-success-card animate-fade-in">
            <div className="success-header text-center">
              <div className="success-badge-circle">
                <CheckCircle2 size={44} className="text-emerald" />
              </div>
              <h2 className="success-title">Payment Successful!</h2>
              <p className="success-sub">
                {formatAmount(paymentResult.amount)} has been allocated & logged to your trip
              </p>
            </div>

            {/* Payment Verified Banner */}
            <div className="email-sent-banner glass-panel">
              <ShieldCheck size={20} className="text-emerald flex-shrink-0" />
              <div className="email-sent-info">
                <span className="email-sent-label">Payment Confirmed & Verified</span>
                <div className="delivery-status-note text-xs mt-1">
                  <span className="text-secondary">Expenses categorized and logged directly to your trip balance.</span>
                </div>

                <div className="invoice-action-links mt-2 flex flex-wrap gap-2">
                  <button 
                    type="button"
                    onClick={handlePrint}
                    className="view-invoice-btn print-action-btn"
                    title="Print or Save as PDF"
                  >
                    <Printer size={13} />
                    <span>Print / PDF</span>
                  </button>

                  <a 
                    href={`http://localhost:5000/api/receipts/${paymentResult.transactionId}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="view-invoice-btn"
                  >
                    <span>📄 Open Full Invoice (HTML)</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* Transaction Details Box */}
            <div className="receipt-meta-box glass-panel">
              <div className="receipt-row">
                <span className="receipt-label">Transaction ID:</span>
                <div className="txn-copy-row">
                  <code>{paymentResult.transactionId}</code>
                  <button className="btn-icon btn-ghost btn-xs" onClick={handleCopyTxn} title="Copy ID">
                    {copiedTxn ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Payment Method:</span>
                <span className="font-semibold">{paymentResult.paymentMethod}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Trip Destination:</span>
                <span className="font-semibold">{trip.destination} ({trip.country || 'Global'})</span>
              </div>
            </div>

            {/* Result Category Split Table */}
            <div className="receipt-split-box">
              <h4 className="receipt-split-title">
                <span>Expenses by Category Split (100% of Budget):</span>
              </h4>
              <div className="receipt-split-list">
                {paymentResult.split.map(item => {
                  const meta = CATEGORY_META[item.category] || CATEGORY_META.Other;
                  const Icon = meta.icon;
                  return (
                    <div key={item.category} className="receipt-split-item">
                      <div className="receipt-item-left">
                        <div className="receipt-cat-icon" style={{ backgroundColor: `${meta.color}22`, color: meta.color }}>
                          <Icon size={14} />
                        </div>
                        <span className="receipt-cat-name">{item.category}</span>
                        <span className="receipt-cat-share">({item.percent}%)</span>
                      </div>
                      <span className="receipt-cat-amount">{formatAmount(item.amount)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-actions-row mt-4">
              <button className="btn btn-primary w-full" onClick={onClose}>
                <span>Done & View Expenses Breakdown</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        ) : (
          /* Payment Form */
          <form onSubmit={handlePay} className="payment-form">
            
            {/* Amount & Destination Banner */}
            <div className="payment-amount-card glass-panel">
              <div className="amount-label-row">
                <span>Total Payment Amount:</span>
                <span className="badge badge-emerald">{currencyInfo.code} ({currencyInfo.symbol})</span>
              </div>
              <div className="amount-input-wrap">
                <span className="currency-prefix">{currencyInfo.symbol}</span>
                <input 
                  type="number" 
                  min="500" 
                  step="100"
                  required
                  value={amount} 
                  onChange={e => setAmount(e.target.value)}
                  className="amount-number-input"
                  placeholder="e.g. 85000"
                />
              </div>
              <span className="amount-helper">
                Budget for {trip.destination} • Automatically divided into the 6 expense categories below
              </span>
            </div>

            {/* Category Split Breakdown Card (Exact Match to User Screenshot) */}
            <div className="category-split-preview glass-panel">
              <div className="split-header-row">
                <span className="split-heading">Expenses by Category Split Breakdown</span>
                <span className="badge badge-cyan">Auto-Calculated</span>
              </div>

              {/* Progress split bar */}
              <div className="multi-bar-track">
                {categoriesList.map(cat => (
                  <div 
                    key={cat.name} 
                    className="bar-segment" 
                    style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                    title={`${cat.name}: ${cat.percent}% (${formatAmount(cat.amount)})`}
                  />
                ))}
              </div>

              {/* 6 Category Items Grid */}
              <div className="split-categories-grid">
                {categoriesList.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <div key={cat.name} className="split-card-item">
                      <div className="split-item-left">
                        <div className="split-icon-badge" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                          <Icon size={14} />
                        </div>
                        <div>
                          <div className="split-item-name">{cat.name}</div>
                          <span className="split-item-share">{cat.percent}% of budget</span>
                        </div>
                      </div>
                      <div className="split-item-val">
                        {formatAmount(cat.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>


            {/* Payment Method Selector Tabs */}
            <div className="form-group">
              <label className="form-label">Choose Payment Method</label>
              <div className="payment-method-tabs">
                <button 
                  type="button"
                  className={`pm-tab-btn ${paymentMethod === 'UPI' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('UPI')}
                >
                  <Smartphone size={16} />
                  <span>UPI / QR</span>
                </button>
                <button 
                  type="button"
                  className={`pm-tab-btn ${paymentMethod === 'Card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('Card')}
                >
                  <CreditCard size={16} />
                  <span>Cards</span>
                </button>
                <button 
                  type="button"
                  className={`pm-tab-btn ${paymentMethod === 'NetBanking' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('NetBanking')}
                >
                  <Building2 size={16} />
                  <span>Net Banking</span>
                </button>
                <button 
                  type="button"
                  className={`pm-tab-btn ${paymentMethod === 'Wallet' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('Wallet')}
                >
                  <Wallet size={16} />
                  <span>Wallets</span>
                </button>
              </div>
            </div>

            {/* Method Details */}
            {paymentMethod === 'UPI' && (
              <div className="payment-method-box glass-panel animate-fade-in">
                <div className="upi-app-chips">
                  {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map(app => (
                    <button 
                      type="button" 
                      key={app} 
                      className={`upi-chip ${selectedUpiApp === app ? 'active' : ''}`}
                      onClick={() => setSelectedUpiApp(app)}
                    >
                      <span>{app}</span>
                    </button>
                  ))}
                </div>

                <div className="form-group mt-3">
                  <label className="text-xs text-muted">UPI ID / VPA</label>
                  <input 
                    type="text" 
                    value={upiId} 
                    onChange={e => setUpiId(e.target.value)} 
                    placeholder="e.g. 9876543210@paytm or name@okaxis" 
                    className="form-input"
                  />
                </div>

                <div className="upi-qr-note">
                  <QrCode size={16} className="text-emerald flex-shrink-0" />
                  <span>Instant verification • 0% gateway surcharge • Zero processing fee</span>
                </div>
              </div>
            )}

            {paymentMethod === 'Card' && (
              <div className="payment-method-box glass-panel animate-fade-in">
                <div className="form-group">
                  <label className="text-xs text-muted">Cardholder Name</label>
                  <input 
                    type="text" 
                    value={cardName} 
                    onChange={e => setCardName(e.target.value)} 
                    className="form-input" 
                    placeholder="Name on card"
                  />
                </div>
                <div className="form-group">
                  <label className="text-xs text-muted">Card Number</label>
                  <input 
                    type="text" 
                    value={cardNumber} 
                    onChange={e => setCardNumber(e.target.value)} 
                    className="form-input" 
                    placeholder="16-digit card number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted">Expiry (MM/YY)</label>
                    <input 
                      type="text" 
                      value={cardExpiry} 
                      onChange={e => setCardExpiry(e.target.value)} 
                      className="form-input" 
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted">CVV</label>
                    <input 
                      type="password" 
                      maxLength="4"
                      value={cardCvv} 
                      onChange={e => setCardCvv(e.target.value)} 
                      className="form-input" 
                      placeholder="•••"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'NetBanking' && (
              <div className="payment-method-box glass-panel animate-fade-in">
                <label className="text-xs text-muted mb-2 block">Select Bank Account</label>
                <div className="grid grid-cols-2 gap-2">
                  {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map(bank => (
                    <button 
                      type="button" 
                      key={bank}
                      className={`bank-selector-btn ${selectedBank === bank ? 'active' : ''}`}
                      onClick={() => setSelectedBank(bank)}
                    >
                      <Building2 size={13} />
                      <span>{bank}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {paymentMethod === 'Wallet' && (
              <div className="payment-method-box glass-panel animate-fade-in">
                <label className="text-xs text-muted mb-2 block">Choose Wallet Partner</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Amazon Pay', 'Paytm Wallet', 'MobiKwik', 'LazyPay Later'].map(w => (
                    <button 
                      type="button" 
                      key={w}
                      className={`bank-selector-btn ${selectedWallet === w ? 'active' : ''}`}
                      onClick={() => setSelectedWallet(w)}
                    >
                      <Wallet size={13} />
                      <span>{w}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="payment-submit-row">
              <button 
                type="submit" 
                className="btn btn-primary payment-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Pay {formatAmount(numAmount)} & Confirm Allocation</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

            <div className="security-guarantee-note">
              <Lock size={12} className="text-cyan" />
              <span>256-bit Encrypted SSL Gateway • ISO 27001 Certified • Instant Email Delivery</span>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
