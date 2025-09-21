import { create } from 'zustand';

const useStore = create((set) => ({
  // STATE
  currentUser: null, // 'operator', 'corporate', 'auditor'
  tokens: [],
  operatorStats: {
    impactGenerated: 0,
    impactDistributed: 0,
    valueObtained: 0,
  },

  // ACTIONS
  login: (userType) => set({ currentUser: userType }),
  logout: () => set({ currentUser: null }),

  mintToken: (newToken) => set((state) => ({
    tokens: [...state.tokens, newToken],
    operatorStats: {
      ...state.operatorStats,
      impactGenerated: state.operatorStats.impactGenerated + 1,
    }
  })),

  purchaseToken: (tokenId, buyer) => set((state) => {
    const tokenPrice = state.tokens.find(t => t.id === tokenId)?.price || 0;
    return {
      tokens: state.tokens.map((token) =>
        token.id === tokenId
          ? { ...token, status: 'Purchased', owner: buyer, transactionReceiptCID: `bafy_mock_receipt_${tokenId}` }
          : token
      ),
      operatorStats: {
        ...state.operatorStats,
        impactDistributed: state.operatorStats.impactDistributed + 1,
        valueObtained: state.operatorStats.valueObtained + tokenPrice,
      }
    }
  }),

  redeemToken: (tokenId) => set((state) => ({
    tokens: state.tokens.map((token) =>
      token.id === tokenId 
        ? { ...token, status: 'Redeemed', certificateCID: `bafy_mock_cert_${tokenId}` } 
        : token
    ),
  })),

}));

export default useStore;