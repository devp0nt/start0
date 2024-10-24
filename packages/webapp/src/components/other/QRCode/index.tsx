import qrcodeGenerator from 'qrcode'
import { useEffect, useState } from 'react'

export const QRCodeImage = ({ data }: { data?: string | null }) => {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    if (data) {
      qrcodeGenerator
        .toDataURL(data)
        .then((url) => {
          setSrc(url)
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error)
        })
    }
  }, [data])
  if (!src) {
    return null
  }
  return <img style={{ maxWidth: 300, width: '100%', height: 'auto' }} src={src} alt="" />
}
