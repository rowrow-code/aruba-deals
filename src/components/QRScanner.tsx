'use client'

import { useEffect, useRef } from 'react'

interface QRScannerProps {
  onScan: (code: string) => void
  onError?: (error: string) => void
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let scanner: any = null

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        const containerId = 'qr-scanner-container'
        scanner = new Html5Qrcode(containerId)
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            onScan(decodedText)
          },
          () => {
            // Scanning in progress — ignore frame errors
          }
        )
      } catch (err: any) {
        onError?.(err?.message ?? 'Failed to start camera')
      }
    }

    startScanner()

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
        scannerRef.current = null
      }
    }
  }, [onScan, onError])

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200">
      <div id="qr-scanner-container" ref={containerRef} className="w-full" />
    </div>
  )
}
