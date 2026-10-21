import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = (searchParams.get('title') || 'wStrip Photobooth').slice(0, 80);
    const subtitle = (searchParams.get('subtitle') || 'Snap. Strip. Share.').slice(0, 120);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage:
              'linear-gradient(135deg, #ffd9c2 0%, #c9d3ff 50%, #ffc7e1 100%)',
            color: '#1d1d1f',
            padding: '40px',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.75)',
              borderRadius: '28px',
              padding: '56px 80px',
              boxShadow: '0 30px 60px -20px rgba(30,30,60,0.35)',
            }}
          >
            <div style={{ display: 'flex', gap: '10px', marginBottom: '28px' }}>
              <div style={{ width: 18, height: 18, borderRadius: 9, background: '#ff5f57' }} />
              <div style={{ width: 18, height: 18, borderRadius: 9, background: '#febc2e' }} />
              <div style={{ width: 18, height: 18, borderRadius: 9, background: '#28c840' }} />
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#007aff', marginBottom: 12 }}>
              wStrip
            </div>
            <div
              style={{
                fontSize: 66,
                fontWeight: 800,
                textAlign: 'center',
                letterSpacing: '-0.03em',
                maxWidth: 860,
              }}
            >
              {title}
            </div>
            <div style={{ fontSize: 28, color: 'rgba(60,60,67,0.7)', marginTop: 14 }}>
              {subtitle}
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200',
        },
      }
    );
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Unknown error';
    return new Response(`Failed to generate the image: ${errorMsg}`, { status: 500 });
  }
}
