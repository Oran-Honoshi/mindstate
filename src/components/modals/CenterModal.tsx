'use client'

import { ReactNode } from 'react'

interface CenterModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export function CenterModal({ isOpen, onClose, children }: CenterModalProps) {
  if (!isOpen) return null
  return (
    <>
      <style>{`@keyframes fadeScale{from{opacity:0;transform:translate(-50%,-50%) scale(0.92)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}`}</style>
      <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
        <div
          onClick={onClose}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)' }}
        />
        <div style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'calc(100% - 48px)', maxWidth: 340,
          background: 'var(--surf)',
          borderRadius: 'var(--r-card)',
          padding: 24,
          zIndex: 101,
          animation: 'fadeScale 220ms ease-out',
        }}>
          {children}
        </div>
      </div>
    </>
  )
}
