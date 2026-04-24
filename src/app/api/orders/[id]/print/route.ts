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

    const order = await prisma.order.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        items: { include: { item: true } }
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const itemsHTML = order.items.map((item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.item?.name || item.description || 'Producto'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">${item.qty}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.unitPrice.toLocaleString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">$${item.amount.toLocaleString()}</td>
      </tr>
    `).join('')

    const statusColors: any = {
      pending: '#fef3c7',
      processing: '#dbeafe',
      completed: '#d1fae5',
      delivered: '#065f46',
      cancelled: '#fee2e2'
    }
    const statusBg = statusColors[order.status] || '#fef3c7'

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Pedido #${order.id.slice(-6)}</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
  <div style="display: flex; justify-content: space-between; padding-bottom: 20px; border-bottom: 2px solid #333; margin-bottom: 20px;">
    <div style="font-size: 24px; font-weight: bold;">COTIZANET</div>
    <div style="text-align: right;">
      <div style="font-size: 20px; font-weight: bold;">Pedido #${order.id.slice(-6)}</div>
      <div>Fecha: ${new Date(order.createdAt).toLocaleDateString('es-MX')}</div>
      ${order.dueDate ? `<div>Entrega: ${new Date(order.dueDate).toLocaleDateString('es-MX')}</div>` : ''}
      <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: ${statusBg};">${order.status}</span>
    </div>
  </div>

  <div style="margin-bottom: 20px;">
    <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; color: #666;">Cliente</div>
    <div style="font-weight: bold;">${order.customer.businessName}</div>
    ${order.customer.email ? `<div>${order.customer.email}</div>` : ''}
    ${order.customer.phone ? `<div>${order.customer.phone}</div>` : ''}
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
    <div>Subtotal: $${order.total.toLocaleString()}</div>
    <div>IVA (16%): $${(order.total * 0.16).toLocaleString()}</div>
    <div style="font-size: 18px; font-weight: bold;">Total: $${(order.total * 1.16).toLocaleString()}</div>
  </div>

  ${order.notes ? `
  <div style="margin-bottom: 20px;">
    <div style="font-size: 14px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; color: #666;">Notas</div>
    <p>${order.notes}</p>
  </div>
  ` : ''}

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666;">
    <p>CotizaNet - cotizanet.com</p>
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
    console.error('Error generating order:', error)
    return NextResponse.json({ error: 'Error generating order' }, { status: 500 })
  }
}