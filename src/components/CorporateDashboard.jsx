import React, { useState } from 'react';
import useStore from '../store/useStore';
import logo from '../assets/logo.jpg';
import { ShoppingCart, Briefcase, FileText, CheckCircle, ExternalLink, X } from 'lucide-react';

// --- Main Component ---
const CorporateDashboard = () => {
  const { tokens, purchaseToken, redeemToken, logout } = useStore((state) => ({
    tokens: state.tokens,
    purchaseToken: state.purchaseToken,
    redeemToken: state.redeemToken,
    logout: state.logout,
  }));
  
  const [activeTab, setActiveTab] = useState('marketplace');
  const [showPaymentModal, setShowPaymentModal] = useState(null); // Will hold the token to buy
  const [showCertificate, setShowCertificate] = useState(null); // Will hold the redeemed token

  const availableTokens = tokens.filter(t => t.status === 'Available');
  const myTokens = tokens.filter(t => t.owner === 'corporate'); // In a real app, this would be a user ID

  const handlePurchase = (token) => {
    // In a real app, this would trigger a payment gateway. Here, we simulate it.
    purchaseToken(token.id, 'corporate');
    setShowPaymentModal(null);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onLogout={logout} />
      <main className="p-8 max-w-7xl mx-auto">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <TabButton title="Green Token Marketplace" icon={<ShoppingCart />} isActive={activeTab === 'marketplace'} onClick={() => setActiveTab('marketplace')} />
            <TabButton title="My Impact Portfolio" icon={<Briefcase />} isActive={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} />
          </nav>
        </div>

        {activeTab === 'marketplace' && (
          <TokenGrid tokens={availableTokens} onAction={setShowPaymentModal} actionLabel="Purchase" actionIcon={<ShoppingCart size={16}/>} />
        )}
        
        {activeTab === 'portfolio' && (
           <TokenGrid 
            tokens={myTokens} 
            onAction={(token) => token.status === 'Redeemed' ? setShowCertificate(token) : redeemToken(token.id)} 
            actionLabel={(token) => token.status === 'Redeemed' ? "View Certificate" : "Redeem"} 
            actionIcon={(token) => token.status === 'Redeemed' ? <FileText size={16}/> : <CheckCircle size={16}/>}
            showReceiptLink={true}
          />
        )}
      </main>

      {showPaymentModal && <PaymentModal token={showPaymentModal} onConfirm={() => handlePurchase(showPaymentModal)} onCancel={() => setShowPaymentModal(null)} />}
      {showCertificate && <CertificateModal token={showCertificate} onCancel={() => setShowCertificate(null)} />}
    </div>
  );
};


// --- Sub-Components ---

const Header = ({ onLogout }) => (
  <header className="bg-white shadow-md p-4 flex justify-between items-center">
    <div className="flex items-center gap-3">
      <img src={logo} alt="EcoChinh Logo" className="h-10" />
      <h1 className="text-2xl font-bold text-charcoal">Verifiable ESG Portfolio</h1>
    </div>
    <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
      Logout
    </button>
  </header>
);

const TabButton = ({ title, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`${
      isActive
        ? 'border-trusty-blue text-trusty-blue'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
  >
    {icon}
    {title}
  </button>
);

const TokenGrid = ({ tokens, onAction, actionLabel, actionIcon, showReceiptLink }) => {
  if (tokens.length === 0) {
    return <div className="text-center py-16 text-gray-500">No assets available in this view.</div>
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tokens.map(token => <TokenCard key={token.id} token={token} onAction={onAction} actionLabel={actionLabel} actionIcon={actionIcon} showReceiptLink={showReceiptLink}/>)}
    </div>
  );
};

const TokenCard = ({ token, onAction, actionLabel, actionIcon, showReceiptLink }) => {
  const label = typeof actionLabel === 'function' ? actionLabel(token) : actionLabel;
  const icon = typeof actionIcon === 'function' ? actionIcon(token) : actionIcon;
  const isRedeemed = token.status === 'Redeemed';

  return (
    <div className={`bg-white p-6 rounded-lg shadow-lg transition-all duration-300 ${isRedeemed ? 'opacity-60' : 'hover:shadow-xl hover:-translate-y-1'}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-forest">{token.material}</p>
          <p className="text-xs text-gray-400">{token.id}</p>
        </div>
         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            token.status === 'Available' ? 'bg-green-100 text-green-800' :
            token.status === 'Purchased' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>{token.status}</span>
      </div>
      <div className="my-4 border-t border-gray-100"></div>
      <div className="space-y-2 text-sm">
        <p><strong>Impact:</strong> {token.finalWeight || token.estimatedWeight} kg</p>
        <p><strong>Source:</strong> {token.source}</p>
        <p><strong>Vintage:</strong> {token.vintage}</p>
      </div>
       <div className="my-4 border-t border-gray-100"></div>
      <div className="flex justify-between items-center">
        <p className="text-xl font-bold text-charcoal">₹{token.price.toLocaleString('en-IN')}</p>
        <button 
          onClick={() => onAction(token)}
          disabled={isRedeemed && label !== 'View Certificate'}
          className={`bg-trusty-blue text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors ${isRedeemed && label !== 'View Certificate' ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-blue-700'}`}
        >
          {icon}{label}
        </button>
      </div>
      {showReceiptLink && token.status !== 'Available' && (
        <div className="mt-4 pt-2 border-t border-gray-100">
           <a href="#" onClick={(e) => e.preventDefault()} className="text-xs text-trusty-blue hover:underline flex items-center gap-1">
            View Verifiable Receipt (IPFS) <ExternalLink size={12}/>
          </a>
        </div>
      )}
    </div>
  )
};

const PaymentModal = ({ token, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Confirm Purchase</h2>
      <p className="text-gray-600 mb-6">You are about to acquire the following green asset:</p>
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <p><strong>Asset ID:</strong> {token.id}</p>
        <p><strong>Impact:</strong> {token.finalWeight} kg of {token.material}</p>
        <p className="font-bold text-lg mt-2">Price: ₹{token.price.toLocaleString('en-IN')}</p>
      </div>
      <div className="flex justify-end gap-4">
        <button onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-charcoal font-bold py-2 px-4 rounded-lg">Cancel</button>
        <button onClick={onConfirm} className="bg-trusty-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">Pay Securely</button>
      </div>
    </div>
  </div>
);

const CertificateModal = ({ token, onCancel }) => (
   <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
    <div className="bg-white p-10 rounded-lg shadow-2xl w-full max-w-2xl relative border-4 border-forest">
      <button onClick={onCancel} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><X /></button>
      <div className="text-center mb-6">
        <img src={logo} alt="EcoChinh Logo" className="w-24 mx-auto mb-2"/>
        <h2 className="text-3xl font-bold text-charcoal">Official Impact Certificate</h2>
        <p className="text-gray-500">This document certifies the redemption of a verifiable environmental asset.</p>
      </div>
      <div className="text-left space-y-3 bg-gray-50 p-6 rounded-md">
        <p><strong>Asset ID:</strong> {token.id}</p>
        <p><strong>Batch ID:</strong> {token.batchId}</p>
        <p><strong>Verified Impact:</strong> {token.finalWeight} kg of {token.material}</p>
        <p><strong>Source Facility:</strong> {token.source}</p>
        <p><strong>Date of Action (Vintage):</strong> {token.vintage}</p>
        <p><strong>Redeemed By:</strong> Corporate User (Demo)</p>
        <p><strong>Date of Redemption:</strong> {new Date().toLocaleDateString('en-IN')}</p>
      </div>
      <div className="mt-6 text-center">
        <a href="#" onClick={(e) => e.preventDefault()} className="text-xs text-trusty-blue hover:underline flex items-center justify-center gap-1">
          View Original Certificate on IPFS: {token.certificateCID} <ExternalLink size={12}/>
        </a>
      </div>
    </div>
  </div>
);

export default CorporateDashboard;