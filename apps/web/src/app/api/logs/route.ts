import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route xử lý ghi log từ client
 *
 * Mục đích: Nhận log từ frontend và forward tới backend API
 * hoặc log trực tiếp console trên server
 *
 * Đầu vào: POST body với { level, service, message, category, action, meta, timestamp }
 * Đầu ra: { success: true } hoặc error
 *
 * Được gọi từ: logger.ts trên client-side
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { level, service, message, category, action, meta, timestamp } = body;

    // Log ra console server-side (để debug và Railway logs)
    const logPrefix = `[${level?.toUpperCase() || 'LOG'}][${service || 'web'}]`;
    console.log(logPrefix, message, { category, action, meta, timestamp });

    // Nếu có API backend, có thể forward log tới đó
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      try {
        await fetch(`${apiUrl}/logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } catch {
        // Silent fail - logging không nên break app
        console.warn('Không thể gửi log tới backend API');
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lỗi xử lý log request:', error);
    return NextResponse.json(
      { error: 'Lỗi xử lý log request' },
      { status: 500 },
    );
  }
}

// Cho phép OPTIONS request (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
