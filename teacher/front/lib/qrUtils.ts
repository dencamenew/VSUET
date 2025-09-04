// lib/qrUtils.ts
export interface QRGenerationRequest {
  subject: string
  group: string
  time: string
  date: string
  teacherName: string
}

export interface QRGenerationResponse {
  qrUUID: string
  qrUrl: string
  expiresAt: string
  expiresIn: number
}

export const generateQRCode = async (request: QRGenerationRequest): Promise<QRGenerationResponse> => {
  const response = await fetch('http://localhost:8080/api/qr/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error('Failed to generate QR code')
  }

  return response.json()
}