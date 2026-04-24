import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const sessionData = JSON.parse(session)
    const { companyId } = sessionData

    const quote = await prisma.quote.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        items: { include: { item: true } }
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    const itemsHTML = quote.items.map((item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.item?.name || item.description || 'Producto'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.qty}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.unitPrice.toLocaleString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.amount.toLocaleString()}</td>
      </tr>
    `).join('')

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Cotización #${quote.id.slice(-6)}</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
  <div style="display: flex; justify-content: space-between; padding-bottom: 20px; border-bottom: 2px solid #333; margin-bottom: 20px;">
    <div style="font-size: 24px; font-weight: bold;">COTIZANET</div>
    <div style="text-align: right;">
      <div style="font-size: 20px; font-weight: bold;">Cotización #${quote.id.slice(-6)}</div>
      <div>Fecha: ${new Date(quote.createdAt).toLocaleDateString('es-MX')}</div>
      <div>Válido hasta: ${quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('es-MX') : '30 días'}</div>
    </div>
  </div>

  <div style="margin-bottom: 20px;">
    <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; color: #666;">Cliente</div>
    <div style="font-weight: bold;">${quote.customer.businessName}</div>
    ${quote.customer.email ? `<div>${quote.customer.email}</div>` : ''}
    ${quote.customer.phone ? `<div>${quote.customer.phone}</div>` : ''}
  </div>

  <div style="margin-bottom: 20px;">
    <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; color: #666;">Productos</div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background: #333; color: white;">
          <th style="padding: 8px; text-align: left;">Producto</th>
          <th style="padding: 8px; text-align: right;">Cantidad</th>
          <th style="padding: 8px; text-align: right;">Precio</th>
          <th style="padding: 8px; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>
  </div>

  <div style="text-align: right; margin-bottom: 20px;">
    <div>Subtotal: $${quote.total.toLocaleString()}</div>
    <div>IVA (16%): $${(quote.total * 0.16).toLocaleString()}</div>
    <div style="font-size: 18px; font-weight: bold;">Total: $${(quote.total * 1.16).toLocaleString()}</div>
  </div>

  ${quote.notes ? `
  <div style="margin-bottom: 20px;">
    <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; color: #666;">Notas</div>
    <p>${quote.notes}</p>
  </div>
  ` : ''}

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666;">
    <p>Esta cotización es válida por 30 días. CotizaNet - cotizanet.com</p>
  </div>
</body>
</html>
    `.trim()

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error generating quote:', error)
    return NextResponse.json({ error: 'Error generating quote' }, { status: 500 })
  }
}