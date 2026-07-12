import QRCode from 'qrcode';

export async function generateQRCode(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      width: 256,
      margin: 2,
      color: {
        dark: '#FFD700',
        light: '#141b2d',
      },
    });
  } catch {
    return '';
  }
}

export function generateJoinLink(roomCode: string): string {
  const base = window.location.origin;
  return `${base}/join?room=${roomCode}`;
}
