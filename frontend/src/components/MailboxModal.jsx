import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  CheckCircle2, 
  ExternalLink, 
  Printer, 
  Send, 
  Clock, 
  Receipt, 
  ShieldCheck, 
  Copy, 
  Check, 
  Inbox, 
  ChevronRight,
  Sparkles,
  Calendar,
  DollarSign
} from 'lucide-react';
import { api } from '../api';
import { useCurrency } from '../context/CurrencyContext';

export default function MailboxModal({ isOpen, onClose, user, onOpenExpenses }) {
  if (!isOpen) return null;

  const { formatAmount } = useCurrency();
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedTxn, setCopiedTxn] = useState(false);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await api.getReceipts();
      const list = res.receipts || [];
      setReceipts(list);
      if (list.length > 0) {
        setSelectedReceipt(list[0]);
      }
    } catch (err) {
      console.error('Error fetching receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedTxn(true);
    setTimeout(() => setCopiedTxn(false), 2000);
  };

  const handleOpenGmail = (receipt) => {
    if (!receipt) return;
    const splitText = (receipt.split || [])
      .map(s => `• ${s.category} (${s.percent}%): ${formatAmount(s.amount)}`)
      .join('\n');

    const subject = encodeURIComponent(`✈️ TripMate Payment Receipt & Invoice - ${receipt.destination} (TXN: ${receipt.transaction_id})`);
    const body = encodeURIComponent(
      `TripMate Payment Confirmation & Travel Expense Invoice\n` +
      `====================================================\n\n` +
      `Destination: ${receipt.destination} (${receipt.country || 'Global'})\n` +
      `Trip Title: ${receipt.trip_title || receipt.destination}\n` +
      `Total Paid: ${formatAmount(receipt.amount)}\n` +
      `Payment Method: ${receipt.payment_method}\n` +
      `Transaction ID: ${receipt.transaction_id}\n` +
      `Date: ${new Date(receipt.created_at).toLocaleString('en-IN')}\n\n` +
      `Itemized Expenses by Category Split:\n` +
      `------------------------------------\n` +
      `${splitText}\n\n` +
      `Total Budget Allocation: 100% (${formatAmount(receipt.amount)})\n\n` +
      `View Official Digital Invoice:\n` +
      `http://localhost:5000/api/receipts/${receipt.transaction_id}\n\n` +
      `---\nTripMate Smart Travel Companion`
    );

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(receipt.recipient_email || user?.email || '')}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  };

  const handlePrint = (txnId) => {
    const url = `http://localhost:5000/api/receipts/${txnId}`;
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content mailbox-modal-content" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header mailbox-header">
          <div className="modal-title-wrap">
            <div className="mailbox-icon-badge">
              <Mail size={18} className="text-cyan" />
            </div>
            <div>
              <h3>TripMate Mailbox & Invoices</h3>
              <p className="modal-subtitle">
                Payment confirmations, itemized category splits & receipts for {user?.email || 'your account'}
              </p>
            </div>
          </div>
          <button className="btn-icon btn-ghost" onClick={onClose}>✕</button>
        </div>

        {/* Content Layout */}
        <div className="mailbox-body">
          {loading ? (
            <div className="mailbox-loading">
              <div className="spinner mx-auto mb-3" />
              <p>Loading your receipts & invoices...</p>
            </div>
          ) : receipts.length === 0 ? (
            <div className="mailbox-empty-state text-center p-5">
              <div className="empty-icon-wrap mx-auto mb-3">
                <Inbox size={42} className="text-cyan" />
              </div>
              <h3>No Payment Receipts Yet</h3>
              <p className="text-secondary max-w-md mx-auto mb-4">
                Whenever you pay for a trip and split your travel budget, your official payment confirmation email and tax invoice will appear here automatically.
              </p>
              {onOpenExpenses && (
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    onClose();
                    onOpenExpenses();
                  }}
                >
                  <Receipt size={16} />
                  <span>Go to Expenses & Pay Budget</span>
                </button>
              )}
            </div>
          ) : (
            <div className="mailbox-grid">
              
              {/* Mail list sidebar */}
              <div className="mailbox-list-pane">
                <div className="mailbox-pane-header">
                  <span>Inbox ({receipts.length} Messages)</span>
                </div>
                <div className="mailbox-list">
                  {receipts.map(r => (
                    <div 
                      key={r.id}
                      className={`mail-list-item ${selectedReceipt?.id === r.id ? 'active' : ''}`}
                      onClick={() => setSelectedReceipt(r)}
                    >
                      <div className="mail-item-top">
                        <span className="mail-item-sender">✈️ TripMate Billing</span>
                        <span className="mail-item-date">
                          {new Date(r.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="mail-item-subject">
                        Payment Receipt: {r.destination}
                      </div>
                      <div className="mail-item-preview">
                        {formatAmount(r.amount)} paid via {r.payment_method} • 6-category split logged
                      </div>
                      <div className="mail-item-status-row">
                        <span className="mail-status-tag success">✓ Recorded</span>
                        <span className="mail-txn-code">{r.transaction_id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mail reading detail pane */}
              {selectedReceipt ? (
                <div className="mailbox-detail-pane">
                  
                  {/* Actions Bar */}
                  <div className="mail-actions-bar">
                    <button 
                      className="btn-action-mail gmail-btn"
                      onClick={() => handleOpenGmail(selectedReceipt)}
                      title="Open and send receipt from your Gmail account in 1 click"
                    >
                      <Send size={14} />
                      <span>Open in Gmail (1-Click)</span>
                    </button>

                    <button 
                      className="btn-action-mail print-btn"
                      onClick={() => handlePrint(selectedReceipt.transaction_id)}
                      title="Print or Save as PDF"
                    >
                      <Printer size={14} />
                      <span>Print / PDF</span>
                    </button>

                    <a 
                      href={`http://localhost:5000/api/receipts/${selectedReceipt.transaction_id}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-action-mail invoice-link-btn"
                    >
                      <span>📄 Full HTML Invoice</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  {/* Email header card */}
                  <div className="mail-message-card">
                    <div className="mail-header-meta">
                      <div className="mail-header-row">
                        <span className="meta-label">From:</span>
                        <strong className="meta-value">TripMate Billing &lt;no-reply@tripmate.com&gt;</strong>
                      </div>
                      <div className="mail-header-row">
                        <span className="meta-label">To:</span>
                        <span className="meta-value text-cyan">{selectedReceipt.recipient_email}</span>
                      </div>
                      <div className="mail-header-row">
                        <span className="meta-label">Date:</span>
                        <span className="meta-value">
                          {new Date(selectedReceipt.created_at).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="mail-header-row">
                        <span className="meta-label">Subject:</span>
                        <span className="meta-value font-bold text-white">
                          ✈️ TripMate Payment Receipt & Booking Confirmation - {selectedReceipt.destination} (TXN: {selectedReceipt.transaction_id})
                        </span>
                      </div>
                    </div>

                    {/* Email Body Preview */}
                    <div className="mail-body-content">
                      <div className="payment-hero-banner">
                        <CheckCircle2 size={32} className="text-emerald" />
                        <div>
                          <h4>Payment of {formatAmount(selectedReceipt.amount)} Received</h4>
                          <p>Allocated for {selectedReceipt.destination} ({selectedReceipt.country || 'Global'})</p>
                        </div>
                      </div>

                      <div className="mail-meta-tags-grid">
                        <div className="mail-meta-tag">
                          <span className="tag-label">Transaction ID</span>
                          <div className="flex items-center gap-1">
                            <code>{selectedReceipt.transaction_id}</code>
                            <button 
                              className="btn-icon btn-ghost btn-xs" 
                              onClick={() => handleCopy(selectedReceipt.transaction_id)}
                              title="Copy Transaction ID"
                            >
                              {copiedTxn ? <Check size={11} className="text-emerald" /> : <Copy size={11} />}
                            </button>
                          </div>
                        </div>
                        <div className="mail-meta-tag">
                          <span className="tag-label">Payment Method</span>
                          <strong>{selectedReceipt.payment_method}</strong>
                        </div>
                        <div className="mail-meta-tag">
                          <span className="tag-label">Trip Title</span>
                          <strong>{selectedReceipt.trip_title || selectedReceipt.destination}</strong>
                        </div>
                      </div>

                      <div className="mail-split-section">
                        <h5>Itemized Expenses by Category (100% Split):</h5>
                        <table className="mail-split-table">
                          <thead>
                            <tr>
                              <th>Category</th>
                              <th className="text-center">Share</th>
                              <th className="text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(selectedReceipt.split || []).map(item => (
                              <tr key={item.category}>
                                <td>{item.category}</td>
                                <td className="text-center text-cyan">{item.percent}%</td>
                                <td className="text-right text-emerald font-semibold">
                                  {formatAmount(item.amount)}
                                </td>
                              </tr>
                            ))}
                            <tr className="total-row">
                              <td>Total Budget Allocation</td>
                              <td className="text-center text-cyan">100%</td>
                              <td className="text-right text-emerald font-bold">
                                {formatAmount(selectedReceipt.amount)}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="mail-footer-note">
                        <ShieldCheck size={16} className="text-emerald flex-shrink-0" />
                        <span>
                          This invoice is permanently recorded in your TripMate account. You can print, download PDF, or dispatch it directly to your Gmail anytime with the buttons above.
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              ) : null}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
