'use client'

import { CSSProperties, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface InputProps {
  label: string
  type?: 'text' | 'email' | 'password' | 'username'
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  autoComplete?: string
  disabled?: boolean
}

export function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
  disabled = false,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPw = type === 'password'
  const inputType = isPw ? (showPassword ? 'text' : 'password') : type === 'username' ? 'text' : type

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: isPw ? '13px 40px 13px 14px' : '13px 14px',
    background: 'var(--surf2)',
    border: `1px solid ${error ? 'var(--hard)' : 'var(--border)'}`,
    borderRadius: 'var(--r-input)',
    fontFamily: 'var(--font-body)',
    fontSize: '15px',
    color: 'var(--text)',
    outline: 'none',
    transition: 'border-color 150ms ease',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
      <label style={{
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        fontSize: '13px',
        color: 'var(--text)',
      }}>
        {label}
      </label>

      <div style={{ position: 'relative' }}>
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          disabled={disabled}
          style={inputStyle}
          onFocus={(e) => {
            if (!error) e.currentTarget.style.borderColor = 'var(--accent)'
          }}
          onBlur={(e) => {
            if (!error) e.currentTarget.style.borderColor = 'var(--border)'
          }}
        />
        {isPw && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            disabled={disabled}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              padding: 0,
            }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden' }}
          >
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--hard)',
            }}>
              {error}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
