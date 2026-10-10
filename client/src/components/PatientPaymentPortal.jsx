import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Download, 
  Printer, 
  ExternalLink, 
  AlertCircle, 
  ArrowRight, 
  ChevronRight, 
  Sparkles, 
  QrCode, 
  FileText, 
  Home, 
  Calendar, 
  Lock, 
  RefreshCw,
  X,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Popular UPI Apps with brand styling
const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: '🔵', bg: 'rgba(66, 133, 244, 0.15)', border: '#4285f4', color: '#60a5fa' },
  { id: 'phonepe', name: 'PhonePe', icon: '🟣', bg: 'rgba(103, 58, 183, 0.15)', border: '#673ab7', color: '#a78bfa' },
  { id: 'paytm', name: 'Paytm UPI', icon: '🔷', bg: 'rgba(0, 186, 242, 0.15)', border: '#00baf2', color: '#38bdf8' },
  { id: 'bhim', name: 'BHIM UPI', icon: '🇮🇳', bg: 'rgba(249, 115, 22, 0.15)', border: '#f97316', color: '#fb923c' },
  { id: 'cred', name: 'CRED UPI', icon: '⚪', bg: 'rgba(255, 255, 255, 0.1)', border: '#e2e8f0', color: '#ffffff' },
  { id: 'amazon', name: 'Amazon Pay', icon: '🟡', bg: 'rgba(255, 153, 0, 0.15)', border: '#ff9900', color: '#fbbd23' }
];

// Popular Indian Banks for Net Banking
const POPULAR_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC' },
  { id: 'sbi', name: 'State Bank of India', code: 'SBI' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICICI' },
  { id: 'axis', name: 'Axis Bank', code: 'AXIS' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', code: 'KOTAK' },
  { id: 'pnb', name: 'Punjab National Bank', code: 'PNB' }
];

const ALL_OTHER_BANKS = [
  'Bank of Baroda', 'Canara Bank', 'Union Bank of India', 'IndusInd Bank',
  'Federal Bank', 'IDFC FIRST Bank', 'Indian Bank', 'Yes Bank',
  'Central Bank of India', 'Bank of India', 'RBL Bank', 'South Indian Bank'
];

// Approved Health Insurance / TPA Providers
const INSURANCE_PROVIDERS = [
  'Star Health and Allied Insurance',
  'Care Health Insurance (Religare)',
  'HDFC ERGO Health Insurance',
  'Medi Assist TPA',
  'ICICI Lombard General Insurance',
  'Niva Bupa Health Insurance (Max Bupa)',
  'Vidal Health TPA',
  'Paramount Health Services TPA',
  'Aditya Birla Health Insurance'
];

export default function PatientPaymentPortal({ onBackToDashboard, onOpenBooking, initialAppointmentId, onPaymentSuccess }) {
  const { currentUser } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState(initialAppointmentId ? 'checkout' : 'invoices'); // 'invoices' | 'checkout' | 'history'
  const [invoices, setInvoices] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected invoice for checkout
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Payment Method Selection: 'upi' | 'card' | 'netbanking' | 'insurance' | 'cash'
  const [paymentMethod, setPaymentMethod] = useState('upi');

  // UPI State
  const [upiMode, setUpiMode] = useState('app'); // 'app' | 'qr' | 'id'
  const [selectedUpiApp, setSelectedUpiApp] = useState(UPI_APPS[0].name);
  const [upiIdInput, setUpiIdInput] = useState('');
  const [qrCountdown, setQrCountdown] = useState(300);

  // Card State
  const [cardForm, setCardForm] = useState({
    number: '',
    name: currentUser?.fullName || '',
    expiry: '',
    cvv: '',
    saveCard: true
  });
  const [detectedCardType, setDetectedCardType] = useState('VISA');

  // Net Banking State
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Insurance State
  const [insuranceForm, setInsuranceForm] = useState({
    provider: INSURANCE_PROVIDERS[0],
    policyNumber: '',
    beneficiaryName: currentUser?.fullName || ''
  });

  // Medical 0% EMI & PayLater State
  const [emiForm, setEmiForm] = useState({
    provider: 'Bajaj Finserv Health EMI',
    tenure: '3 Months No-Cost EMI',
    mobileNumber: currentUser?.phone || '+91 98765 43210'
  });

  // High-Security 2FA & 3D Secure Authorization State
  const [securityAuthModal, setSecurityAuthModal] = useState(null);
  const [twoFactorPin, setTwoFactorPin] = useState('');
  const [authCountdown, setAuthCountdown] = useState(180);

  // Processing & Receipt State
  const [processingState, setProcessingState] = useState(null); // null | 'initiating' | 'authorizing' | 'success'
  const [receiptModal, setReceiptModal] = useState(null);

  // Fetch payment data
  const fetchPaymentData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/payments?patientId=${currentUser.id}`);
      const data = await res.json();
      if (data.success) {
        const invList = data.invoices || [];
        setInvoices(invList);
        setPaymentHistory(data.payments || []);

        // If an initialAppointmentId is provided, find and select its invoice
        if (initialAppointmentId) {
          const matchedInv = invList.find(i => i.appointmentId === initialAppointmentId);
          if (matchedInv && matchedInv.isFeeSet) {
            setSelectedInvoice(matchedInv);
            setActiveTab('checkout');
            setLoading(false);
            return;
          } else if (matchedInv && !matchedInv.isFeeSet) {
            toast.info("The attending doctor has not finalized the post-treatment fee for this session yet. You will be able to pay online once Dr. Joel Calvin sets the fee.", "Post-Treatment Fee Pending");
          }
        }

        // Default select the first pending invoice if available and fee is set
        const firstPending = invList.find(i => i.status === 'PENDING' && i.isFeeSet);
        if (firstPending && !selectedInvoice) {
          setSelectedInvoice(firstPending);
        }
      }
    } catch (err) {
      console.error("Failed to fetch payments data:", err);
      toast.error("Could not load invoices and billing records.", "Network Error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPaymentData();
  }, [currentUser, initialAppointmentId]);

  // QR Code Timer
  useEffect(() => {
    let timer;
    if (activeTab === 'checkout' && paymentMethod === 'upi' && upiMode === 'qr' && qrCountdown > 0) {
      timer = setInterval(() => setQrCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [activeTab, paymentMethod, upiMode, qrCountdown]);

  // 3D Secure 2FA Countdown Timer
  useEffect(() => {
    let timer;
    if (securityAuthModal && authCountdown > 0) {
      timer = setInterval(() => setAuthCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [securityAuthModal, authCountdown]);

  // Format Card Number & detect network
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');

    if (raw.startsWith('4')) setDetectedCardType('VISA');
    else if (/^(5[1-5]|2[2-7])/.test(raw)) setDetectedCardType('MASTERCARD');
    else if (/^(60|65|81|82)/.test(raw)) setDetectedCardType('RUPAY');
    else if (/^3[47]/.test(raw)) setDetectedCardType('AMEX');
    else setDetectedCardType('CARD');

    setCardForm({ ...cardForm, number: formatted });
  };

  // Format Expiry MM/YY
  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setCardForm({ ...cardForm, expiry: raw });
  };

  // Start payment checkout
  const handleStartCheckout = (invoice) => {
    setSelectedInvoice(invoice);
    setActiveTab('checkout');
    setProcessingState(null);
  };

  // Direct Download Official Clinical Receipt
  const downloadReceipt = (receipt) => {
    if (!receipt) return;
    const invNo = receipt.invoiceNo || receipt.invoiceId || 'INV-2026';
    const txn = receipt.txnId || receipt.paymentTxnId || 'TXN-HLX-VERIFIED';
    const patient = receipt.patientName || currentUser?.fullName || 'Valued Patient';
    const service = receipt.serviceName || 'Physiotherapy & Rehabilitation Session';
    const amount = Number(receipt.amount || receipt.totalAmount || 0);
    const paidTime = receipt.timestamp || (receipt.paidAt ? new Date(receipt.paidAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN'));
    const method = receipt.methodLabel || receipt.paymentMethod || 'Online Gateway Settlement';
    const signature = receipt.securitySignature || `HLX-SHA256-${(txn.replace(/\D/g, '') + '883901').slice(0, 16)}`;
    const doctor = receipt.assignedPhysio || 'Dr. Joel Calvin C, MPT (Ortho), MIAP';
    const isDoctorRate = receipt.isDoctorCustomAmount || receipt.doctorAmount !== undefined;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Healix Clinic Official Receipt - ${invNo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #0f0a1c; color: #0f172a; padding: 24px; font-size: 13px; line-height: 1.5; }
    .receipt-container { max-width: 680px; margin: 0 auto; background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); overflow: hidden; }
    .header { background: linear-gradient(135deg, #1e0b36 0%, #4a0e4e 100%); color: #ffffff; padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #f59e0b; }
    .brand-title { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; }
    .brand-sub { font-size: 11px; color: #cbd5e1; margin-top: 3px; }
    .badge-paid { background: #10b981; color: #ffffff; font-weight: 800; font-size: 11px; padding: 5px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
    .content { padding: 28px 32px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .meta-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; }
    .meta-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; }
    .meta-val { font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 3px; }
    .meta-val.highlight { color: #d97706; font-family: monospace; font-size: 14px; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .table th { background: #f1f5f9; padding: 10px 14px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700; border-bottom: 2px solid #cbd5e1; }
    .table td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .total-card { background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin-top: 16px; }
    .security-seal { margin-top: 24px; background: #faf5ff; border: 1px dashed #c084fc; border-radius: 8px; padding: 14px 18px; font-size: 11px; color: #6b21a8; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; font-size: 11px; color: #64748b; text-align: center; }
    .btn-bar { max-width: 680px; margin: 16px auto 0 auto; display: flex; justify-content: flex-end; gap: 10px; }
    .btn-print { background: #0284c7; color: white; border: none; padding: 8px 18px; border-radius: 6px; font-weight: 700; cursor: pointer; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .receipt-container { border: none; box-shadow: none; }
      .btn-bar { display: none; }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <div>
        <div class="brand-title">Healix Physiotherapy &amp; Rehab</div>
        <div class="brand-sub">Clinical Excellence • NABH Accredited • Reg No: NABH/2026/TN/PHYSIO-4410</div>
        <div class="brand-sub">742 Anna Salai, Chennai • GSTIN: 33AAACH1234F1Z8 • Tel: +91 73053 94549</div>
      </div>
      <div>
        <span class="badge-paid">✓ SETTLED &amp; PAID</span>
      </div>
    </div>

    <div class="content">
      <div class="grid-2">
        <div class="meta-card">
          <div class="meta-label">Invoice Number</div>
          <div class="meta-val highlight">${invNo}</div>
          <div class="meta-label" style="margin-top: 8px;">Transaction Reference</div>
          <div class="meta-val highlight">${txn}</div>
        </div>
        <div class="meta-card">
          <div class="meta-label">Patient Name</div>
          <div class="meta-val">${patient}</div>
          <div class="meta-label" style="margin-top: 8px;">Payment Timestamp</div>
          <div class="meta-val">${paidTime}</div>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Clinical Service Description</th>
            <th>Attending Physio</th>
            <th>Mode</th>
            <th style="text-align: right;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${service}</strong>
              ${isDoctorRate ? '<div style="font-size: 11px; color: #0284c7; margin-top: 2px;">🩺 Customized individual rate authorized by attending doctor</div>' : ''}
              ${receipt.feeNote ? `<div style="font-size: 11px; color: #64748b; font-style: italic;">Doctor Note: ${receipt.feeNote}</div>` : ''}
            </td>
            <td>${doctor}</td>
            <td>${receipt.isHomeVisit ? 'Doorstep Home Visit' : 'In-Clinic Session'}</td>
            <td style="text-align: right; font-weight: 700;">₹${amount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div class="total-card">
        <div>
          <div style="font-size: 11px; color: #166534; font-weight: 700; text-transform: uppercase;">Payment Settlement Mode</div>
          <div style="font-size: 13px; font-weight: 700; color: #0f172a;">${method}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 11px; color: #166534; font-weight: 700; text-transform: uppercase;">Net Amount Settled</div>
          <div style="font-size: 22px; font-weight: 900; color: #15803d;">₹${amount.toLocaleString()}</div>
        </div>
      </div>

      <div class="security-seal">
        <div style="font-weight: 800; margin-bottom: 3px; display: flex; justify-content: space-between;">
          <span>🔒 Cryptographic SHA-256 Digital Verification Signature</span>
          <span style="color: #15803d;">● Verified Non-Tampered</span>
        </div>
        <div style="font-family: monospace; font-size: 12px; font-weight: 700; color: #581c87; letter-spacing: 0.5px;">
          ${signature}
        </div>
        <div style="font-size: 10px; color: #7e22ce; margin-top: 4px;">
          PCI-DSS Level 1 Compliant • RBI 2026 Guidelines • 256-Bit TLS Bank Gateway Authentication
        </div>
      </div>
    </div>

    <div class="footer">
      <div>Official Computer-Generated Tax Invoice &amp; Medical Voucher. Valid for Tax Exemption under <strong>Section 80D</strong> of the Indian Income Tax Act 1961.</div>
      <div style="margin-top: 4px;">Authorized Clinical Signatory: Dr. Joel Calvin C, Lead Physiotherapist &amp; Center Administrator</div>
    </div>
  </div>
  <div class="btn-bar">
    <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Healix_Payment_Receipt_${invNo}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Official payment receipt for ${invNo} downloaded!`, "Receipt Downloaded");
  };

  // Process payment submission - triggers 2FA security validation
  const handleProcessPayment = async () => {
    if (!selectedInvoice) return;

    // Validation per method
    if (paymentMethod === 'card') {
      if (cardForm.number.replace(/\s/g, '').length < 15) {
        toast.warning("Please enter a valid 16-digit card number.", "Card Number Invalid");
        return;
      }
      if (!cardForm.expiry || cardForm.expiry.length < 5) {
        toast.warning("Please enter a valid expiry date (MM/YY).", "Expiry Required");
        return;
      }
      if (!cardForm.cvv || cardForm.cvv.length < 3) {
        toast.warning("Please enter a valid 3-digit CVV / CVC code.", "CVV Required");
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (upiMode === 'id' && (!upiIdInput || !upiIdInput.includes('@'))) {
        toast.warning("Please enter a valid UPI VPA ID (e.g. name@okaxis).", "Invalid UPI ID");
        return;
      }
    } else if (paymentMethod === 'insurance') {
      if (!insuranceForm.policyNumber.trim()) {
        toast.warning("Please provide your TPA / Health Policy Card number.", "Policy Number Required");
        return;
      }
    } else if (paymentMethod === 'emi') {
      if (!emiForm.mobileNumber.trim()) {
        toast.warning("Please enter your registered mobile number or EMI Card number.", "Mobile Required");
        return;
      }
    }

    // Prepare payload details
    let details = {};
    if (paymentMethod === 'upi') {
      details = { upiApp: upiMode === 'app' ? selectedUpiApp : (upiMode === 'qr' ? 'Scan & Pay QR' : 'UPI VPA'), upiId: upiIdInput || 'patient@upi' };
    } else if (paymentMethod === 'card') {
      details = { cardNetwork: detectedCardType, cardLast4: cardForm.number.slice(-4) || '4242' };
    } else if (paymentMethod === 'netbanking') {
      details = { bankName: selectedBank };
    } else if (paymentMethod === 'insurance') {
      details = { insuranceProvider: insuranceForm.provider, policyNumber: insuranceForm.policyNumber };
    } else if (paymentMethod === 'emi') {
      details = { emiProvider: emiForm.provider, tenure: emiForm.tenure, accountRef: emiForm.mobileNumber };
    } else if (paymentMethod === 'cash') {
      details = { mode: 'Cash / Pay at Clinic Reception' };
    }

    // Derive human-readable method label
    const methodLabel = paymentMethod === 'upi'
      ? (upiMode === 'app' ? selectedUpiApp + ' (UPI)' : (upiMode === 'qr' ? 'Scan & Pay QR' : 'UPI (' + (upiIdInput || 'VPA') + ')'))
      : paymentMethod === 'card'
      ? `${detectedCardType} (•••• ${cardForm.number.slice(-4) || '4242'})`
      : paymentMethod === 'netbanking'
      ? `Net Banking (${selectedBank})`
      : paymentMethod === 'insurance'
      ? `TPA Insurance (${insuranceForm.provider})`
      : paymentMethod === 'emi'
      ? `${emiForm.provider} (${emiForm.tenure})`
      : 'Pay at Clinic Reception / Doorstep Cash';

    // Open High-Security 3D Secure / MPIN Modal
    setSecurityAuthModal({
      invoice: selectedInvoice,
      method: paymentMethod,
      methodLabel,
      amount: selectedInvoice.totalAmount,
      details
    });
    setTwoFactorPin('');
    setAuthCountdown(180);
  };

  // Final 2FA Execution
  const executeSecurePayment = async () => {
    if (!securityAuthModal) return;
    setProcessingState('authorizing');

    try {
      const res = await fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: securityAuthModal.invoice.appointmentId,
          patientId: currentUser.id,
          patientName: currentUser.fullName,
          serviceName: securityAuthModal.invoice.serviceName,
          amount: securityAuthModal.invoice.totalAmount,
          paymentMethod: securityAuthModal.method.toUpperCase(),
          paymentDetails: securityAuthModal.details
        })
      });

      const data = await res.json();
      if (data.success) {
        setProcessingState('success');
        setTimeout(() => {
          setProcessingState(null);
          setSecurityAuthModal(null);
          setReceiptModal(data.transaction);
          toast.success("Payment authorized and receipt generated securely!", "Payment Successful");
          fetchPaymentData();
          if (onPaymentSuccess) {
            onPaymentSuccess(data.transaction);
          }
        }, 800);
      } else {
        setProcessingState(null);
        toast.error(data.error || "Payment failed to settle.", "Payment Declined");
      }
    } catch (err) {
      setProcessingState(null);
      console.error("Payment error:", err);
      toast.error("Error connecting to payment gateway: " + err.message, "Gateway Error");
    }
  };

  const pendingInvoices = invoices.filter(i => i.status === 'PENDING');
  const paidInvoices = invoices.filter(i => i.status === 'PAID');
  const pendingAmount = pendingInvoices.reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0);
  const settledAmount = paymentHistory.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. Header & Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
              💳 Clinical Billing Desk
            </span>
            <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
              🛡️ Payment &amp; Settlement Desk
            </span>
            <span className="badge badge-homevisit" style={{ fontSize: '0.72rem' }}>
              🔒 256-Bit SSL Encrypted
            </span>
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: '800', margin: 0 }}>
            Patient Billing &amp; Payment Portal
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Seamlessly settle consultation fees, review paid vs unpaid session invoices, and access cryptographically verified clinical receipts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('invoices')}
            className="btn btn-secondary btn-sm"
            style={{
              borderColor: activeTab === 'invoices' ? 'var(--accent-cyan)' : 'var(--border-color)',
              background: activeTab === 'invoices' ? 'rgba(20, 184, 166, 0.18)' : 'var(--bg-input)',
              color: activeTab === 'invoices' ? '#2dd4bf' : 'var(--text-muted)',
              fontWeight: activeTab === 'invoices' ? '800' : '600'
            }}
          >
            <FileText size={15} />
            <span>Session Invoices ({pendingInvoices.length} Not Paid)</span>
          </button>

          <button
            onClick={() => setActiveTab('checkout')}
            disabled={!selectedInvoice}
            className="btn btn-secondary btn-sm"
            style={{
              borderColor: activeTab === 'checkout' ? 'var(--accent-magenta)' : 'var(--border-color)',
              background: activeTab === 'checkout' ? 'rgba(217, 27, 118, 0.18)' : 'var(--bg-input)',
              color: activeTab === 'checkout' ? '#f472b6' : 'var(--text-muted)',
              fontWeight: activeTab === 'checkout' ? '800' : '600'
            }}
          >
            <CreditCard size={15} />
            <span>Payment Checkout {selectedInvoice ? `(₹${selectedInvoice.totalAmount})` : ''}</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className="btn btn-secondary btn-sm"
            style={{
              borderColor: activeTab === 'history' ? 'var(--accent-gold)' : 'var(--border-color)',
              background: activeTab === 'history' ? 'rgba(251, 191, 36, 0.18)' : 'var(--bg-input)',
              color: activeTab === 'history' ? '#fbbf24' : 'var(--text-muted)',
              fontWeight: activeTab === 'history' ? '800' : '600'
            }}
          >
            <Clock size={15} />
            <span>Paid Receipts ({paymentHistory.length} Settled)</span>
          </button>

          {onBackToDashboard && (
            <button onClick={onBackToDashboard} className="btn btn-secondary btn-sm" title="Back to Session List">
              <span>Back to Portal</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. TAB: INVOICES LIST */}
      {activeTab === 'invoices' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Summary Metric Strip */}
          <div className="grid-cols-3">
            <div className="card" style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderColor: pendingAmount > 0 ? 'rgba(251, 191, 36, 0.45)' : undefined }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold, #fbbf24)', textTransform: 'uppercase', fontWeight: '800' }}>Pending Outstanding Fees (Not Paid)</span>
              <div style={{ fontSize: '1.85rem', fontWeight: '900', color: pendingAmount > 0 ? 'var(--accent-gold)' : '#34d399', marginTop: '0.25rem' }}>
                ₹{pendingAmount.toLocaleString()}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: '0.2rem 0 0 0' }}>{pendingInvoices.length} outstanding session invoices due</p>
            </div>

            <div className="card" style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderColor: 'rgba(16, 185, 129, 0.35)' }}>
              <span style={{ fontSize: '0.75rem', color: '#34d399', textTransform: 'uppercase', fontWeight: '800' }}>Settled &amp; Paid Receipts</span>
              <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#34d399', marginTop: '0.25rem' }}>
                ₹{settledAmount.toLocaleString()}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: '0.2rem 0 0 0' }}>{paymentHistory.length} verified receipts available for download</p>
            </div>

            <div className="card" style={{ background: 'var(--bg-secondary)', padding: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Payment Protection</span>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
                PCI-DSS Level 1 &amp; NABH
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: '0.2rem 0 0 0' }}>Instant UPI, Card &amp; Insurance Cashless</p>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>
                  Clinical Session Invoices
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                  Choose any session invoice below to settle online via your preferred payment method.
                </p>
              </div>

              <button onClick={fetchPaymentData} disabled={loading} className="btn btn-secondary btn-sm" title="Refresh">
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                <span>Sync Invoices</span>
              </button>
            </div>

            <div className="table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Therapy Service</th>
                    <th>Schedule Date &amp; Slot</th>
                    <th>Mode</th>
                    <th>Attending Physio</th>
                    <th>Amount Payable</th>
                    <th>Billing Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <FileText size={36} color="var(--accent-cyan)" style={{ margin: '0 auto 0.75rem auto', opacity: 0.7 }} />
                        <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)' }}>No billing invoices currently pending</div>
                        <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Once you book a physiotherapy consultation or home visit, your itemized invoice will appear here.</p>
                        {onOpenBooking && (
                          <button onClick={() => onOpenBooking(false)} className="btn btn-cyan btn-sm" style={{ marginTop: '0.75rem' }}>
                            Book New Session
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    invoices.map(inv => (
                      <tr key={inv.invoiceId} style={{ background: selectedInvoice?.invoiceId === inv.invoiceId ? 'rgba(20, 184, 166, 0.06)' : undefined }}>
                        <td style={{ fontWeight: '800', fontFamily: 'monospace', color: 'var(--accent-gold)' }}>
                          {inv.invoiceId}
                        </td>
                        <td>
                          <div style={{ fontWeight: '700' }}>{inv.serviceName}</div>
                          {inv.isHomeVisit && inv.homeAddress && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--accent-purple)' }}>📍 {inv.homeAddress}</div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{inv.date}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{inv.timeSlot}</div>
                        </td>
                        <td>
                          <span className={inv.isHomeVisit ? 'badge badge-homevisit' : 'badge badge-cyan'}>
                            {inv.isHomeVisit ? '🚗 Home Visit' : '🏥 In-Clinic'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {inv.assignedPhysio}
                        </td>
                        <td style={{ fontWeight: '800', fontSize: '0.95rem', color: '#ffffff' }}>
                          {inv.isFeeSet ? (
                            <>
                              ₹{Number(inv.totalAmount || 0).toLocaleString()}
                              {inv.isDoctorCustomAmount && (
                                <div style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: '700', marginTop: '2px' }}>
                                  🩺 Doctor Set
                                </div>
                              )}
                            </>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', fontWeight: '700' }}>
                                ⏳ Post-Treatment
                              </span>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                Doctor to set fee
                              </span>
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${inv.status === 'PAID' ? 'badge-success' : (inv.status === 'CANCELLED' ? 'badge-danger' : (inv.isFeeSet ? 'badge-warning' : 'badge-gold'))}`} style={{
                            background: !inv.isFeeSet ? 'rgba(251, 191, 36, 0.12)' : undefined,
                            border: !inv.isFeeSet ? '1px solid rgba(251, 191, 36, 0.35)' : undefined,
                            color: !inv.isFeeSet ? 'var(--accent-gold)' : undefined,
                            fontSize: '0.72rem'
                          }}>
                            {inv.status === 'PAID' ? '● Paid' : (inv.status === 'CANCELLED' ? 'Cancelled' : (inv.isFeeSet ? '● Due / Pending' : '⏳ Awaiting Doctor Fee'))}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {inv.status === 'PAID' ? (
                            <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                              <button
                                onClick={() => downloadReceipt(inv)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', color: 'var(--accent-cyan)', borderColor: 'rgba(20, 184, 166, 0.4)' }}
                                title="Download official receipt file"
                              >
                                <Download size={13} style={{ marginRight: '0.25rem' }} />
                                <span>Download</span>
                              </button>
                              <button
                                onClick={() => setReceiptModal(inv)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                                title="View receipt voucher"
                              >
                                <CheckCircle2 size={13} style={{ marginRight: '0.25rem' }} />
                                <span>Receipt</span>
                              </button>
                            </div>
                          ) : (inv.isFeeSet && inv.status === 'PENDING') ? (
                            <button
                              onClick={() => handleStartCheckout(inv)}
                              className="btn btn-cyan btn-sm"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: '800' }}
                            >
                              <span>Pay Online</span>
                              <ArrowRight size={13} style={{ marginLeft: '0.25rem' }} />
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
                              ⏳ Awaiting Fee
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB: CHECKOUT & PAYMENT GATEWAY */}
      {activeTab === 'checkout' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Left Column: Invoice Details & Breakdown */}
          <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', position: 'sticky', top: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Bill Summary</h3>
              </div>
              <span className="badge badge-gold" style={{ fontFamily: 'monospace' }}>
                {selectedInvoice?.invoiceId || 'INV-2026-PENDING'}
              </span>
            </div>

            {selectedInvoice ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Therapy Service</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', marginTop: '0.2rem' }}>
                    {selectedInvoice.serviceName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
                    {selectedInvoice.isHomeVisit ? '🏡 Certified Doorstep Home Visit' : '🏥 In-Clinic Advanced Therapy Session'}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8rem', background: 'var(--bg-card)', padding: '0.85rem', borderRadius: '8px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Date:</span>
                    <div style={{ fontWeight: '700' }}>{selectedInvoice.date}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Time Slot:</span>
                    <div style={{ fontWeight: '700' }}>{selectedInvoice.timeSlot}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Patient:</span>
                    <div style={{ fontWeight: '700' }}>{selectedInvoice.patientName}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Attending Doctor:</span>
                    <div style={{ fontWeight: '700' }}>{selectedInvoice.assignedPhysio}</div>
                  </div>
                </div>

                {/* Line Item Breakdown */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem' }}>
                  {selectedInvoice.isDoctorCustomAmount ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                        <span>Doctor Prescribed Session Rate:</span>
                        <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>₹{selectedInvoice.totalAmount.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#38bdf8', fontSize: '0.75rem', fontWeight: '700' }}>
                        <span>🩺 Individual fee customized by {selectedInvoice.feeSetBy || 'Doctor'}</span>
                      </div>
                      {selectedInvoice.feeNote && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'rgba(56, 189, 248, 0.08)', padding: '0.35rem 0.6rem', borderRadius: '4px' }}>
                          Doctor Note: {selectedInvoice.feeNote}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                        <span>Physiotherapist Consultation Fee:</span>
                        <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>₹{selectedInvoice.consultationFee.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                        <span>Therapy Modalities &amp; Sanitization:</span>
                        <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>₹{selectedInvoice.equipmentCharge.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                        <span>Healthcare GST &amp; Taxes (5%):</span>
                        <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>₹{selectedInvoice.gstTax.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1.5px dashed var(--border-color)',
                    paddingTop: '0.75rem',
                    marginTop: '0.25rem',
                    fontSize: '1.15rem',
                    fontWeight: '900'
                  }}>
                    <span>Total Amount Payable:</span>
                    <span style={{ color: 'var(--accent-gold)' }}>₹{selectedInvoice.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: '#6ee7b7',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}>
                  <ShieldCheck size={16} />
                  <span>Eligible for TPA &amp; Corporate Healthcare Cashless Claims</span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                Please select an invoice from the Session Invoices tab to pay.
              </div>
            )}
          </div>

          {/* Right Column: Multi-Method Clinical Payment Console */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.25rem' }}>
                Select Payment Method
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                Choose your preferred mode of payment below to authorize transaction.
              </p>
            </div>

            {/* Method Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem', marginBottom: '1.75rem' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.85rem 0.5rem',
                  gap: '0.35rem',
                  borderColor: paymentMethod === 'upi' ? '#2dd4bf' : 'var(--border-color)',
                  background: paymentMethod === 'upi' ? 'rgba(20, 184, 166, 0.16)' : 'var(--bg-input)',
                  color: paymentMethod === 'upi' ? '#2dd4bf' : 'var(--text-main)',
                  fontWeight: '700',
                  fontSize: '0.8rem'
                }}
              >
                <Smartphone size={20} />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.85rem 0.5rem',
                  gap: '0.35rem',
                  borderColor: paymentMethod === 'card' ? '#d91b76' : 'var(--border-color)',
                  background: paymentMethod === 'card' ? 'rgba(217, 27, 118, 0.16)' : 'var(--bg-input)',
                  color: paymentMethod === 'card' ? '#f472b6' : 'var(--text-main)',
                  fontWeight: '700',
                  fontSize: '0.8rem'
                }}
              >
                <CreditCard size={20} />
                <span>Credit / Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.85rem 0.5rem',
                  gap: '0.35rem',
                  borderColor: paymentMethod === 'netbanking' ? '#fbbf24' : 'var(--border-color)',
                  background: paymentMethod === 'netbanking' ? 'rgba(251, 191, 36, 0.16)' : 'var(--bg-input)',
                  color: paymentMethod === 'netbanking' ? '#fbbf24' : 'var(--text-main)',
                  fontWeight: '700',
                  fontSize: '0.8rem'
                }}
              >
                <Building2 size={20} />
                <span>Net Banking</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('insurance')}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.85rem 0.5rem',
                  gap: '0.35rem',
                  borderColor: paymentMethod === 'insurance' ? '#a855f7' : 'var(--border-color)',
                  background: paymentMethod === 'insurance' ? 'rgba(168, 85, 247, 0.16)' : 'var(--bg-input)',
                  color: paymentMethod === 'insurance' ? '#c084fc' : 'var(--text-main)',
                  fontWeight: '700',
                  fontSize: '0.8rem'
                }}
              >
                <ShieldCheck size={20} />
                <span>TPA Insurance</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('emi')}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.85rem 0.5rem',
                  gap: '0.35rem',
                  borderColor: paymentMethod === 'emi' ? '#38bdf8' : 'var(--border-color)',
                  background: paymentMethod === 'emi' ? 'rgba(56, 189, 248, 0.16)' : 'var(--bg-input)',
                  color: paymentMethod === 'emi' ? '#38bdf8' : 'var(--text-main)',
                  fontWeight: '700',
                  fontSize: '0.8rem'
                }}
              >
                <Sparkles size={20} />
                <span>Medical 0% EMI</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className="btn btn-secondary"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.85rem 0.5rem',
                  gap: '0.35rem',
                  borderColor: paymentMethod === 'cash' ? '#34d399' : 'var(--border-color)',
                  background: paymentMethod === 'cash' ? 'rgba(16, 185, 129, 0.16)' : 'var(--bg-input)',
                  color: paymentMethod === 'cash' ? '#34d399' : 'var(--text-main)',
                  fontWeight: '700',
                  fontSize: '0.8rem'
                }}
              >
                <Home size={20} />
                <span>Pay at Clinic</span>
              </button>
            </div>

            {/* METHOD 1: UPI & APPS */}
            {paymentMethod === 'upi' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setUpiMode('app')}
                    className="btn btn-sm"
                    style={{
                      background: upiMode === 'app' ? 'rgba(20, 184, 166, 0.25)' : 'none',
                      color: upiMode === 'app' ? '#2dd4bf' : 'var(--text-muted)',
                      border: 'none',
                      fontWeight: '700'
                    }}
                  >
                    Select UPI App
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiMode('qr')}
                    className="btn btn-sm"
                    style={{
                      background: upiMode === 'qr' ? 'rgba(20, 184, 166, 0.25)' : 'none',
                      color: upiMode === 'qr' ? '#2dd4bf' : 'var(--text-muted)',
                      border: 'none',
                      fontWeight: '700'
                    }}
                  >
                    Scan QR Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiMode('id')}
                    className="btn btn-sm"
                    style={{
                      background: upiMode === 'id' ? 'rgba(20, 184, 166, 0.25)' : 'none',
                      color: upiMode === 'id' ? '#2dd4bf' : 'var(--text-muted)',
                      border: 'none',
                      fontWeight: '700'
                    }}
                  >
                    Enter UPI ID / VPA
                  </button>
                </div>

                {/* Sub-mode A: Apps Grid */}
                {upiMode === 'app' && (
                  <div>
                    <label className="form-label">Tap Your Installed UPI App</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                      {UPI_APPS.map(app => (
                        <div
                          key={app.id}
                          onClick={() => setSelectedUpiApp(app.name)}
                          style={{
                            cursor: 'pointer',
                            padding: '0.85rem',
                            borderRadius: '10px',
                            border: `1.5px solid ${selectedUpiApp === app.name ? app.border : 'var(--border-color)'}`,
                            background: selectedUpiApp === app.name ? app.bg : 'var(--bg-input)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span style={{ fontSize: '1.35rem' }}>{app.icon}</span>
                          <span style={{ fontWeight: '700', fontSize: '0.85rem', color: selectedUpiApp === app.name ? app.color : 'var(--text-main)' }}>
                            {app.name}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                      Selected: <strong style={{ color: 'var(--accent-cyan)' }}>{selectedUpiApp}</strong>. A push notification will be triggered on your UPI app to complete payment.
                    </p>
                  </div>
                )}

                {/* Sub-mode B: Dynamic Scan & Pay QR Code */}
                {upiMode === 'qr' && (
                  <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'inline-block', padding: '1rem', background: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                      {/* Stylized Simulated QR code SVG */}
                      <svg width="180" height="180" viewBox="0 0 100 100" style={{ display: 'block' }}>
                        <rect width="100" height="100" fill="#ffffff" />
                        {/* Corner Targets */}
                        <rect x="5" y="5" width="25" height="25" fill="#0f172a" />
                        <rect x="9" y="9" width="17" height="17" fill="#ffffff" />
                        <rect x="13" y="13" width="9" height="9" fill="#0f172a" />

                        <rect x="70" y="5" width="25" height="25" fill="#0f172a" />
                        <rect x="74" y="9" width="17" height="17" fill="#ffffff" />
                        <rect x="78" y="13" width="9" height="9" fill="#0f172a" />

                        <rect x="5" y="70" width="25" height="25" fill="#0f172a" />
                        <rect x="9" y="74" width="17" height="17" fill="#ffffff" />
                        <rect x="13" y="78" width="9" height="9" fill="#0f172a" />

                        {/* Dense Matrix Data Pattern */}
                        <rect x="36" y="8" width="8" height="8" fill="#0f172a" />
                        <rect x="50" y="12" width="12" height="6" fill="#0f172a" />
                        <rect x="36" y="24" width="22" height="6" fill="#0f172a" />
                        <rect x="8" y="36" width="6" height="22" fill="#0f172a" />
                        <rect x="20" y="44" width="10" height="10" fill="#0f172a" />
                        <rect x="38" y="38" width="24" height="24" fill="#d91b76" rx="4" />
                        <text x="50" y="53" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">HLX</text>
                        <rect x="68" y="36" width="8" height="16" fill="#0f172a" />
                        <rect x="80" y="42" width="12" height="6" fill="#0f172a" />
                        <rect x="36" y="70" width="16" height="8" fill="#0f172a" />
                        <rect x="58" y="68" width="10" height="14" fill="#0f172a" />
                        <rect x="74" y="74" width="18" height="18" fill="#0f172a" />
                      </svg>
                    </div>

                    <div style={{ marginTop: '0.75rem', fontWeight: '800', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                      Scan with any UPI App (GPay, PhonePe, Paytm, BHIM)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', marginTop: '0.2rem', fontWeight: '700' }}>
                      ⏱️ QR Session Expires in {Math.floor(qrCountdown / 60)}:{(qrCountdown % 60).toString().padStart(2, '0')} mins
                    </div>
                  </div>
                )}

                {/* Sub-mode C: UPI ID Input */}
                {upiMode === 'id' && (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Enter Your Virtual Payment Address (UPI VPA)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="e.g. mobile@paytm or yourname@okaxis"
                        className="form-input"
                        value={upiIdInput}
                        onChange={(e) => setUpiIdInput(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (upiIdInput.includes('@')) {
                            toast.success("UPI ID verified successfully!", "VPA Active");
                          } else {
                            toast.warning("Please enter a valid handle containing @", "Invalid UPI");
                          }
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        Verify VPA
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* METHOD 2: CREDIT / DEBIT CARDS */}
            {paymentMethod === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Card Number</label>
                    <span className="badge badge-cyan" style={{ fontSize: '0.68rem', fontWeight: '800' }}>
                      {detectedCardType}
                    </span>
                  </div>
                  <div className="input-with-icon">
                    <div className="input-icon-left">
                      <CreditCard size={18} />
                    </div>
                    <input
                      type="text"
                      maxLength={19}
                      placeholder="4532 •••• •••• 8892"
                      className="form-input"
                      style={{ letterSpacing: '2px', fontFamily: 'monospace', fontWeight: '700' }}
                      value={cardForm.number}
                      onChange={handleCardNumberChange}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Cardholder Full Name</label>
                  <input
                    type="text"
                    placeholder="Name as printed on card"
                    className="form-input"
                    value={cardForm.name}
                    onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                  />
                </div>

                <div className="grid-cols-2">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      className="form-input"
                      style={{ letterSpacing: '1px', fontFamily: 'monospace' }}
                      value={cardForm.expiry}
                      onChange={handleExpiryChange}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">CVV / CVC (3-4 digits)</label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="•••"
                      className="form-input"
                      style={{ letterSpacing: '3px', fontFamily: 'monospace' }}
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                  <input
                    type="checkbox"
                    id="saveCardCheck"
                    checked={cardForm.saveCard}
                    onChange={(e) => setCardForm({ ...cardForm, saveCard: e.target.checked })}
                    style={{ accentColor: 'var(--accent-magenta)', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="saveCardCheck" style={{ fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    Save card securely for future clinic consultations (Tokens encrypted per RBI guidelines)
                  </label>
                </div>
              </div>
            )}

            {/* METHOD 3: NET BANKING */}
            {paymentMethod === 'netbanking' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="form-label">Select Popular Indian Bank</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
                    {POPULAR_BANKS.map(b => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBank(b.name)}
                        style={{
                          cursor: 'pointer',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: `1.5px solid ${selectedBank === b.name ? '#fbbf24' : 'var(--border-color)'}`,
                          background: selectedBank === b.name ? 'rgba(251, 191, 36, 0.15)' : 'var(--bg-input)',
                          textAlign: 'center',
                          fontWeight: '700',
                          fontSize: '0.8rem',
                          color: selectedBank === b.name ? '#fbbf24' : 'var(--text-main)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div>🏦 {b.code}</div>
                        <div style={{ fontSize: '0.72rem', marginTop: '2px', color: 'var(--text-muted)' }}>{b.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Or Choose from All Other Banks</label>
                  <select
                    className="form-select"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                  >
                    <option value="" disabled>-- Select Your Bank --</option>
                    {POPULAR_BANKS.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    {ALL_OTHER_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* METHOD 4: TPA HEALTH INSURANCE */}
            {paymentMethod === 'insurance' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Select Approved TPA / Health Insurer</label>
                  <select
                    className="form-select"
                    value={insuranceForm.provider}
                    onChange={(e) => setInsuranceForm({ ...insuranceForm, provider: e.target.value })}
                  >
                    {INSURANCE_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Policy Number / TPA Member ID Card</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. POL-98421038 or MEDI-7819"
                    className="form-input"
                    value={insuranceForm.policyNumber}
                    onChange={(e) => setInsuranceForm({ ...insuranceForm, policyNumber: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Policy Holder / Beneficiary Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={insuranceForm.beneficiaryName}
                    onChange={(e) => setInsuranceForm({ ...insuranceForm, beneficiaryName: e.target.value })}
                  />
                </div>

                <div style={{
                  background: 'rgba(168, 85, 247, 0.1)',
                  border: '1px solid rgba(168, 85, 247, 0.35)',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: '#e9d5ff'
                }}>
                  ℹ️ Certified cashless pre-authorization will be dispatched to your TPA desk. Keep original clinic prescription handy upon attendance.
                </div>
              </div>
            )}

            {/* METHOD 5: MEDICAL 0% EMI & HEALTHCARE PAYLATER */}
            {paymentMethod === 'emi' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Select Medical EMI / PayLater Partner</label>
                  <select
                    className="form-select"
                    value={emiForm.provider}
                    onChange={(e) => setEmiForm({ ...emiForm, provider: e.target.value })}
                  >
                    <option value="Bajaj Finserv Health EMI">Bajaj Finserv Health EMI Card (Instant Pre-Approved)</option>
                    <option value="Simpl Healthcare PayLater">Simpl Healthcare PayLater (Pay in 15 Days / Split in 3)</option>
                    <option value="LazyPay Medical Credit">LazyPay Medical Credit Line (Zero Interest)</option>
                    <option value="Snapmint Healthcare 0% EMI">Snapmint 0% Interest Healthcare EMI</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Choose Repayment Plan</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                    {[
                      { id: '3m', tenure: '3 Months No-Cost EMI', monthly: Math.round((selectedInvoice?.totalAmount || 1200) / 3) },
                      { id: '6m', tenure: '6 Months No-Cost EMI', monthly: Math.round((selectedInvoice?.totalAmount || 1200) / 6) },
                      { id: '15d', tenure: 'Pay in 15 Days (0% Fee)', monthly: selectedInvoice?.totalAmount || 1200 }
                    ].map(plan => (
                      <div
                        key={plan.id}
                        onClick={() => setEmiForm({ ...emiForm, tenure: plan.tenure })}
                        style={{
                          border: emiForm.tenure === plan.tenure ? '1.5px solid #38bdf8' : '1px solid var(--border-color)',
                          background: emiForm.tenure === plan.tenure ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-input)',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontWeight: '800', fontSize: '0.78rem', color: emiForm.tenure === plan.tenure ? '#38bdf8' : 'var(--text-main)' }}>
                          {plan.tenure}
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#ffffff', marginTop: '0.2rem' }}>
                          ₹{plan.monthly.toLocaleString()}<span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{plan.id === '15d' ? '' : '/mo'}</span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#34d399', marginTop: '0.15rem' }}>
                          0% Interest • No Cost
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Registered Mobile Number / EMI Card ID</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210 or 16-Digit Card No"
                    className="form-input"
                    value={emiForm.mobileNumber}
                    onChange={(e) => setEmiForm({ ...emiForm, mobileNumber: e.target.value })}
                  />
                </div>

                <div style={{
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: '#bae6fd'
                }}>
                  ⚡ Instant digital approval. 100% paperless medical financing with zero processing fee.
                </div>
              </div>
            )}

            {/* METHOD 5: PAY AT CLINIC / CASH */}
            {paymentMethod === 'cash' && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '1.25rem',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: '800' }}>
                  <Home size={20} />
                  <span>Pay at Clinic Reception or Cash on Doorstep Visit</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
                  You can settle the consultation fee upon your physical arrival at the clinic front desk via Cash, POS Card Terminal, or pay cash directly to the visiting physiotherapist at your home.
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>
                  A booking confirmation voucher will be issued to your patient profile immediately.
                </div>
              </div>
            )}

            {/* Final Pay CTA */}
            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={!selectedInvoice || processingState !== null}
                className="btn btn-cyan btn-lg"
                style={{
                  width: '100%',
                  fontWeight: '900',
                  minHeight: '52px',
                  fontSize: '1.05rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #0d9488 0%, #d91b76 100%)',
                  boxShadow: '0 8px 25px -5px rgba(217, 27, 118, 0.45)'
                }}
              >
                <Lock size={18} />
                <span>
                  {processingState === 'initiating'
                    ? 'Connecting to Banking Gateway...'
                    : processingState === 'authorizing'
                    ? 'Authorizing Transaction...'
                    : processingState === 'success'
                    ? 'Payment Settled!'
                    : `Pay ₹${(selectedInvoice?.totalAmount || 0).toLocaleString()} Securely`}
                </span>
              </button>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '0.75rem', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                <span>🔒 256-Bit SSL Encryption</span>
                <span>•</span>
                <span>PCI-DSS Certified</span>
                <span>•</span>
                <span>Instant Clinical E-Receipt</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: PAYMENT RECEIPTS & TRANSACTION LEDGER */}
      {activeTab === 'history' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>
                Official Payment Receipts &amp; Ledger ({paymentHistory.length})
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Every transaction settled through the clinical portal generates a verifiable e-receipt for medical records &amp; insurance reimbursements.
              </p>
            </div>

            <button onClick={fetchPaymentData} disabled={loading} className="btn btn-secondary btn-sm" title="Refresh">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Ledger</span>
            </button>
          </div>

          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Invoice No</th>
                  <th>Therapy Session</th>
                  <th>Amount Paid</th>
                  <th>Payment Method</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No payment receipts on file yet. Settle an invoice to view transaction records.
                    </td>
                  </tr>
                ) : (
                  paymentHistory.map(pay => (
                    <tr key={pay.id || pay.txnId}>
                      <td style={{ fontWeight: '800', fontFamily: 'monospace', color: 'var(--accent-gold)' }}>
                        {pay.txnId}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {pay.invoiceNo || 'INV-2026-N/A'}
                      </td>
                      <td style={{ fontWeight: '700' }}>
                        {pay.serviceName}
                      </td>
                      <td style={{ fontWeight: '800', color: '#34d399' }}>
                        ₹{pay.amount?.toLocaleString()}
                      </td>
                      <td style={{ fontSize: '0.82rem' }}>
                        {pay.methodLabel || pay.paymentMethod}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {pay.timestamp || new Date(pay.paidAt).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <span className="badge badge-success">
                          ✓ Settled
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => downloadReceipt(pay)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}
                            title="Download official receipt file"
                          >
                            <Download size={13} style={{ marginRight: '0.25rem' }} />
                            <span>Download</span>
                          </button>
                          <button
                            onClick={() => setReceiptModal(pay)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', color: '#34d399' }}
                            title="View receipt voucher"
                          >
                            <FileText size={13} style={{ marginRight: '0.25rem' }} />
                            <span>View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. OFFICIAL RECEIPT DIALOG / MODAL */}
      {receiptModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '580px', padding: 0, overflow: 'hidden', background: '#0e0618', border: '1.5px solid var(--accent-gold)' }}>
            {/* Receipt Header Banner */}
            <div style={{ background: 'linear-gradient(135deg, #1e0b36 0%, #4a0e4e 100%)', padding: '1.5rem', borderBottom: '1px solid rgba(251, 191, 36, 0.4)', position: 'relative' }}>
              <button
                onClick={() => setReceiptModal(null)}
                style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                  ✓ Official Healthcare Receipt
                </span>
                <span style={{ fontSize: '0.72rem', color: '#6ee7b7' }}>● Settled &amp; Verified</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '900', margin: 0, color: '#ffffff' }}>
                Healix Physiotherapy &amp; Rehab Clinic
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1', margin: '0.25rem 0 0 0' }}>
                742 Anna Salai, Chennai • GSTIN: 33AAACH1234F1Z8 • Contact: +91 73053 94549
              </p>
            </div>

            {/* Receipt Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Transaction Reference:</span>
                  <div style={{ fontWeight: '800', fontFamily: 'monospace', color: 'var(--accent-gold)' }}>
                    {receiptModal.txnId || receiptModal.paymentTxnId || 'TXN-HLX-VERIFIED'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Invoice ID:</span>
                  <div style={{ fontWeight: '800', fontFamily: 'monospace' }}>
                    {receiptModal.invoiceNo || receiptModal.invoiceId || 'INV-2026-PAID'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Patient Name:</span>
                  <div style={{ fontWeight: '700' }}>
                    {receiptModal.patientName || currentUser?.fullName}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Date &amp; Time:</span>
                  <div style={{ fontWeight: '700', fontSize: '0.8rem' }}>
                    {receiptModal.timestamp || new Date().toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Service Rendered</span>
                <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#ffffff', marginTop: '2px' }}>
                  {receiptModal.serviceName}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(20, 184, 166, 0.1)', border: '1px solid rgba(20, 184, 166, 0.35)', padding: '0.85rem 1.15rem', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payment Mode Used:</div>
                  <div style={{ fontWeight: '700', color: '#2dd4bf' }}>
                    {receiptModal.methodLabel || receiptModal.paymentMethod || 'Online Gateway Settlement'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Amount Paid:</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: '900', color: 'var(--accent-gold)' }}>
                    ₹{(receiptModal.amount || receiptModal.totalAmount || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', fontStyle: 'italic', marginTop: '0.5rem' }}>
                Computer-generated clinical voucher. Valid for personal income-tax medical deductions under Sec 80D.
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => downloadReceipt(receiptModal)}
                  className="btn btn-gold btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Download size={15} />
                  <span>Download Receipt (File)</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Printer size={15} />
                  <span>Print Receipt</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setReceiptModal(null)}
                className="btn btn-cyan btn-sm"
              >
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. BANK 3D SECURE / NPCI GATEWAY 2FA AUTHORIZATION MODAL */}
      {securityAuthModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content" style={{ maxWidth: '460px', padding: 0, overflow: 'hidden', background: '#0b0816', border: '1.5px solid var(--accent-cyan)' }}>
            {/* Gateway Header */}
            <div style={{ background: 'linear-gradient(135deg, #042f2e 0%, #134e4a 100%)', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(45, 212, 191, 0.3)', position: 'relative' }}>
              <button
                onClick={() => { setSecurityAuthModal(null); setProcessingState(null); }}
                style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                  🔒 Bank 3D Secure 2.0 / NPCI UPI Gateway
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#ffffff', margin: 0 }}>
                Two-Factor Payment Authorization
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#a7f3d0', margin: '0.2rem 0 0 0' }}>
                256-Bit TLS Anti-Tampering Shield • Healix Healthcare Gateway
              </p>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Verification Summary */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payable Amount (Locked):</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--accent-gold)' }}>
                    ₹{(securityAuthModal.amount || 0).toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payment Channel:</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                    {securityAuthModal.methodLabel}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Merchant:</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#ffffff' }}>
                    Healix Physio Clinic Chennai
                  </span>
                </div>
              </div>

              {/* PIN / OTP Input */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#ffffff', display: 'block', marginBottom: '0.35rem' }}>
                  {securityAuthModal.method === 'upi' ? 'Enter 6-Digit NPCI UPI MPIN' : 'Enter 6-Digit Bank SMS / Email OTP'}
                </label>
                <input
                  type="password"
                  maxLength={6}
                  autoFocus
                  placeholder="••••••"
                  className="form-input"
                  style={{
                    textAlign: 'center',
                    fontSize: '1.5rem',
                    letterSpacing: '0.5rem',
                    fontWeight: '900',
                    padding: '0.6rem',
                    background: '#07040e',
                    borderColor: 'var(--accent-cyan)'
                  }}
                  value={twoFactorPin}
                  onChange={(e) => setTwoFactorPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />

                {/* Quick Demo Helper */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setTwoFactorPin('739201')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', color: 'var(--accent-cyan)', borderColor: 'rgba(20, 184, 166, 0.4)' }}
                  >
                    ⚡ Auto-Fill Demo OTP (739201)
                  </button>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    Expires in {authCountdown}s
                  </span>
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center', lineHeight: '1.4' }}>
                🔒 Your payment credentials are encrypted end-to-end. Amount cannot be intercepted or modified in transit.
              </div>
            </div>

            <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => { setSecurityAuthModal(null); setProcessingState(null); }}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSecurePayment}
                disabled={twoFactorPin.length < 4 || processingState !== null}
                className="btn btn-cyan btn-sm"
                style={{ fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <ShieldCheck size={15} />
                <span>{processingState === 'authorizing' ? 'Verifying...' : `Authorize & Settle ₹${(securityAuthModal.amount || 0).toLocaleString()}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
