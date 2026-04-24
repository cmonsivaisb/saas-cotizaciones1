import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import jsPDF from 'jspdf'

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
    const { companyId } = JSON.parse(session)
    const order = await prisma.order.findFirst({
      where: { id, companyId },
      include: { customer: true, items: { include: { item: true } } }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const doc = new jsPDF()

    // Header
    doc.setFontSize(24)
    doc.text('COTIZANET', 20, 25)
    
    doc.setFontSize(18)
    doc.text(`Pedido #${order.id.slice(-6)}`, 140, 20)
    doc.setFontSize(10)
    doc.text(`Fecha: ${new Date(order.createdAt).toLocaleDateString('es-MX')}`, 140, 28)
    if (order.dueDate) {
      doc.text(`Entrega: ${new Date(order.dueDate).toLocaleDateString('es-MX')}`, 140, 35)
    }

    // Status badge
    const statusColors: any = {
      pending: [254, 243, 199, 146],
      processing: [219, 234, 254, 29],
      completed: [209, 250, 229, 6],
      delivered: [6, 95, 70, 6],
      cancelled: [254, 226, 226, 153]
    }
    const statusBg = statusColors[order.status] || [254, 243, 199]
    doc.setFillColor(statusBg[0], statusBg[1], statusBg[2])
    doc.roundedRect(160, 38, 30, 8, 2, 2, 'F')
    doc.setFontSize(8)
    doc.text(order.status, 165, 43)

    // Line
    doc.setLineWidth(0.5)
    doc.line(20, 50, 190, 50)

    // Client info
    doc.setFontSize(12)
    doc.text('Cliente:', 20, 60)
    doc.setFontSize(14)
    doc.text(order.customer.businessName, 20, 68)
    
    if (order.customer.email) {
      doc.setFontSize(10)
      doc.text(order.customer.email, 20, 75)
    }
    if (order.customer.phone) {
      doc.text(order.customer.phone || '', 20, 82)
    }

    // Products header
    let y = 100
    doc.setFillColor(51, 51, 51)
    doc.rect(20, y - 5, 170, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.text('Producto', 22, y)
    doc.text('Cant.', 110, y)
    doc.text('Precio', 135, y)
    doc.text('Total', 170, y)

    // Products
    y += 10
    doc.setTextColor(0, 0, 0)
    order.items.forEach((item: any) => {
      doc.text(item.item?.name || item.description || 'Producto', 22, y)
      doc.text(item.qty.toString(), 110, y)
      doc.text(`$${item.unitPrice.toLocaleString()}`, 135, y)
      doc.text(`$${item.amount.toLocaleString()}`, 170, y)
      y += 8
    })

    // Totals
    y += 10
    doc.line(120, y, 190, y)
    y += 10
    doc.text(`Subtotal: $${order.total.toLocaleString()}`, 140, y)
    y += 7
    doc.text(`IVA (16%): $${(order.total * 0.16).toLocaleString()}`, 140, y)
    y += 7
    doc.setFontSize(14)
    doc.text(`Total: $${(order.total * 1.16).toLocaleString()}`, 140, y)

    // Notes
    if (order.notes) {
      y += 20
      doc.setFontSize(12)
      doc.text('Notas:', 20, y)
      doc.setFontSize(10)
      y += 7
      const lines = doc.splitTextToSize(order.notes, 170)
      lines.forEach((line: string) => {
        doc.text(line, 20, y)
        y += 5
      })
    }

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text('CotizaNet - cotizanet.com', 20, 285)

    // Return PDF
    const pdfBuffer = doc.output('arraybuffer')
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="pedido-${order.id.slice(-6)}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Error generating PDF' }, { status: 500 })
  }
}