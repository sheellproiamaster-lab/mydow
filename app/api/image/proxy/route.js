export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  if (!url) return new Response('Missing url', { status: 400 })

  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const buffer = await blob.arrayBuffer()

    return new Response(buffer, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/png',
        'Content-Disposition': 'attachment; filename="mydow-imagem.png"',
        'Cache-Control': 'no-cache',
      },
    })
  } catch {
    return new Response('Failed to fetch image', { status: 500 })
  }
}