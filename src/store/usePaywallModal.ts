'use client'

import { create } from 'zustand'

interface PaywallModalState {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const usePaywallModal = create<PaywallModalState>()((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
