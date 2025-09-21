import React from 'react';
import useStore from '../store/useStore';
import logo from '../assets/logo.jpg';
import { ExternalLink } from 'lucide-react';

const AuditorDashboard = () => {
  const { tokens, logout } = useStore((state) => ({
    tokens: state.tokens,
    logout: state.logout,
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={logo} alt="EcoChinh Logo" className="h-10" />
          <h1 className="text-2xl font-bold text-charcoal">Independent Verification Terminal</h1>
        </div>
        <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          Logout
        </button>
      </header>
      <main className="p-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Immutable Action Ledger</h2>
        <p className="text-gray-600 mb-6">A complete, unfiltered log of all generated environmental assets on the platform.</p>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Token ID</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Source Facility</th>
                  <th scope="col" className="px-6 py-3">Impact (kg)</th>
                  <th scope="col" className="px-6 py-3">Vintage</th>
                  <th scope="col" className="px-6 py-3">Proofs</th>
                </tr>
              </thead>
              <tbody>
                {tokens.length > 0 ? tokens.map((token) => (
                  <tr key={token.id} className="bg-white border-b hover:bg-gray-50">
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                      {token.id}
                    </th>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          token.status === 'Available' ? 'bg-green-100 text-green-800' :
                          token.status === 'Purchased' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>{token.status}</span>
                    </td>
                    <td className="px-6 py-4">{token.source}</td>
                    <td className="px-6 py-4">{token.finalWeight}</td>
                    <td className="px-6 py-4">{token.vintage}</td>
                    <td className="px-6 py-4">
                      <a href="#" onClick={(e) => e.preventDefault()} className="font-medium text-trusty-blue hover:underline flex items-center gap-1">
                        View Proofs (IPFS) <ExternalLink size={14}/>
                      </a>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center py-10">No actions recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuditorDashboard;