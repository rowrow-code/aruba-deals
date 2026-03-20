'use client'

import { useEffect, useRef } from 'react'

interface QRScannerProps {
  onScan: (code: string) => void
  onError?: (error: string) => void
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<any>(null)
  // Keep latest callbacks in refs so the effect never needs to re-run
  const onScanRef = useRef(onScan)
  const onErrorRef = useRef(onError)
  useEffect(() => { onScanRef.current = onScan }, [onScan])
  useEffect(() => { onErrorRef.current = onError }, [onError])

  useEffect(() => {
    let stopped = false

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        const scanner = new Html5Qrcode('qr-scanner-container')
        scannerRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText: string) => {
            if (stopped) return
            stopped = true
            // Stop the camera immediately so no further frames fire
            try { await scanner.stop() } catch {}
            scannerRef.current = null
            onScanRef.current(decodedText)
          },
          () => {
            // Scanning in progress — ignore frame errors
          }
        )
      } catch (err: any) {
        onErrorRef.current?.(err?.message ?? 'Failed to start camera')
      }
    }

    startScanner()

    return () => {
      stopped = true
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
        scannerRef.current = null
      }
    }
  }, []) // Empty deps — scanner starts once, callbacks stay current via refs

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200">
      <div id="qr-scanner-container" className="w-full" />
    </div>
  )
}
