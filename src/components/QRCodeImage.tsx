'use client'

import { useState, useEffect } from 'react'

interface QRCodeImageProps {
  value: string
  size?: number
}

export default function QRCodeImage({ value, size = 192 }: QRCodeImageProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    import('qrcode').then((QRCode) => {
      QRCode.toDataURL(value, { width: size, margin: 2 }).then((url) => {
        if (!cancelled) setDataUrl(url)
      })
    })
    return () => { cancelled = true }
  }, [value, size])

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center bg-gray-100 rounded-xl"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    )
  }

  return (
    <img
      src={dataUrl}
      alt="QR code"
      width={size}
      height={size}
      className="rounded-xl"
    />
  )
}
