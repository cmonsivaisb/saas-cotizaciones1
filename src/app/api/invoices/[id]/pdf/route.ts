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
    
    // Get invoice with order details
    const invoice = await prisma.invoice.findFirst({
      where: { id, companyId },
      include: {
        company: true,
        order: {
          include: {
            customer: true,
            items: { include: { item: true } }
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const order = invoice.order
    const company = invoice.company

    if (!order || !company) {
      return NextResponse.json({ error: 'Order or company not found' }, { status: 404 })
    }

    const doc = new jsPDF()

    // Header
    doc.setFontSize(24)
    doc.text('COTIZANET', 20, 25)
    
    doc.setFontSize(18)
    doc.text(`FACTURA #${invoice.concept}`, 140, 20)
    doc.setFontSize(10)
    doc.text(`Fecha: ${new Date(invoice.createdAt).toLocaleDateString('es-MX')}`, 140, 28)
    if (invoice.dueAt) {
      doc.text(`Vence: ${new Date(invoice.dueAt).toLocaleDateString('es-MX')}`, 140, 35)
    }
    doc.text(`Estado: ${invoice.status}`, 140, 42)

    // Company info
    if (company) {
      doc.setFontSize(10)
      doc.text(company.name || '', 20, 35)
      if (company.email) doc.text(company.email, 20, 42)
    }

    // Line
    doc.setLineWidth(0.5)
    doc.line(20, 50, 190, 50)

    // Client info
    doc.setFontSize(12)
    doc.text('Cliente:', 20, 60)
    doc.setFontSize(14)
    doc.text(order.customer.businessName, 20, 68)
    
    if (order.customer.rfc) {
      doc.setFontSize(10)
      doc.text(`RFC: ${order.customer.rfc}`, 20, 75)
    }
    if (order.customer.email) {
      doc.text(order.customer.email, 20, 82)
    }
    if (order.customer.phone) {
      doc.text(order.customer.phone, 20, 89)
    }
    if (order.customer.address) {
      doc.text(order.customer.address, 20, 96)
    }

    // Order reference
    doc.setFontSize(10)
    doc.text(`Pedido: ${order.id.slice(-6)}`, 20, 110)
    doc.text(`Fecha del pedido: ${new Date(order.createdAt).toLocaleDateString('es-MX')}`, 80, 110)

    // Products header
    let y = 125
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

// Payment info from company settings
    if (company.bankName || company.bankAccount || company.clabe) {
      y += 15
      doc.setFontSize(12)
      doc.text('Información de pago:', 20, y)
      doc.setFontSize(10)
      y += 10
      if (company.bankName) {
        doc.text(`Banco: ${company.bankName}`, 20, y)
        y += 7
      }
      if (company.bankAccount) {
        doc.text(`Cuenta: ${company.bankAccount}`, 20, y)
        y += 7
      }
      if (company.clabe) {
        doc.text(`CLABE: ${company.clabe}`, 20, y)
        y += 7
      }
      if (company.paymentReference) {
        doc.text(`Referencia: ${company.paymentReference}`, 20, y)
        y += 7
      }
    }

    // Notes
    if (order.notes) {
      y += 15
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
    doc.text(`Factura generada el ${new Date().toLocaleDateString()}`, 120, 285)

    // Return PDF
    const pdfBuffer = doc.output('arraybuffer')
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="factura-${invoice.concept}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating invoice PDF:', error)
    return NextResponse.json({ error: 'Error generating PDF' }, { status: 500 })
  }
}