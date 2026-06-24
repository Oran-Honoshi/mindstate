'use client'

import { ReactNode } from 'react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  maxHeight?: string
}

export function BottomSheet({ isOpen, onClose, children, maxHeight = '90vh' }: BottomSheetProps) {
  if (!isOpen) return null
  return (
    <>
      <style>{`@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
        <div
          onClick={onClose}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(3px)' }}
        />
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'var(--surf)',
          borderRadius: 'var(--r-card) var(--r-card) 0 0',
          zIndex: 101,
          maxHeight,
          overflowY: 'auto',
          padding: '0 var(--screen-pad) 32px',
          animation: 'slideUp 250ms ease-out',
        }}>
          <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 99, margin: '12px auto 16px', display: 'block' }} />
          {children}
        </div>
      </div>
    </>
  )
}
