import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const sessionData = JSON.parse(session)
    const { companyId } = sessionData

    const quoteId = params.id

    // Get quote with all details
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    if (quote.companyId !== companyId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Generate HTML for PDF
    const html = generateQuoteHTML(quote)

    // Return HTML (in production, you would use a PDF library like puppeteer or jsPDF)
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="cotizacion-${quote.id}.html"`,
      },
    })
  } catch (error) {
    console.error('Error generating quote PDF:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateQuoteHTML(quote: any): string {
  const total = quote.items.reduce((sum: number, item: any) => sum + item.total, 0)
  const subtotal = total
  const tax = subtotal * 0.16 // 16% IVA
  const grandTotal = subtotal + tax

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cotización #${quote.id} - CotizaNet</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #3b82f6;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #3b82f6;
      margin-bottom: 5px;
    }
    .tagline {
      font-size: 14px;
      color: #6b7280;
    }
    .quote-info {
      text-align: right;
    }
    .quote-number {
      font-size: 24px;
      font-weight: bold;
      color: #3b82f6;
      margin-bottom: 5px;
    }
    .quote-date {
      font-size: 14px;
      color: #6b7280;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    .client-info {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .client-info p {
      margin: 5px 0;
      font-size: 14px;
    }
    .client-info strong {
      color: #1f2937;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: #3b82f6;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 14px;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .totals {
      margin-top: 20px;
      text-align: right;
    }
    .total-row {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: 10px;
      font-size: 16px;
    }
    .total-row strong {
      margin-right: 20px;
      color: #1f2937;
    }
    .total-row .amount {
      font-weight: bold;
      color: #3b82f6;
      min-width: 150px;
    }
    .grand-total {
      font-size: 24px;
      color: #3b82f6;
    }
    .notes {
      background: #fef3c7;
      padding: 20px;
      border-radius: 8px;
      margin-top: 30px;
      border-left: 4px solid #f59e0b;
    }
    .notes h4 {
      margin: 0 0 10px 0;
      color: #92400e;
      font-size: 16px;
    }
    .notes p {
      margin: 0;
      font-size: 14px;
      color: #78350f;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #3b82f6;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-draft {
      background: #e5e7eb;
      color: #6b7280;
    }
    .status-sent {
      background: #dbeafe;
      color: #1e40af;
    }
    .status-accepted {
      background: #d1fae5;
      color: #065f46;
    }
    .status-rejected {
      background: #fee2e2;
      color: #991b1b;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div>
        <div class="logo">CotizaNet</div>
        <div class="tagline">Cotizaciones, pedidos y cobranza para PyMEs</div>
      </div>
      <div class="quote-info">
        <div class="quote-number">Cotización #${quote.id}</div>
        <div class="quote-date">
          Fecha: ${new Date(quote.createdAt).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
        <div class="quote-date">
          Válido hasta: ${quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'Sin vencimiento'}
        </div>
        <div style="margin-top: 10px;">
          <span class="status-badge status-${quote.status}">
            ${getStatusText(quote.status)}
          </span>
        </div>
      </div>
    </div>

    <!-- Client Info -->
    <div class="section">
      <h3 class="section-title">Información del Cliente</h3>
      <div class="client-info">
        <p><strong>Nombre:</strong> ${quote.client.name}</p>
        ${quote.client.email ? `<p><strong>Email:</strong> ${quote.client.email}</p>` : ''}
        ${quote.client.phone ? `<p><strong>Teléfono:</strong> ${quote.client.phone}</p>` : ''}
        ${quote.client.address ? `<p><strong>Dirección:</strong> ${quote.client.address}</p>` : ''}
        ${quote.client.rfc ? `<p><strong>RFC:</strong> ${quote.client.rfc}</p>` : ''}
      </div>
    </div>

    <!-- Items Table -->
    <div class="section">
      <h3 class="section-title">Detalle de Cotización</h3>
      <table>
        <thead>
          <tr>
            <th>Descripción</th>
            <th class="text-center">Cantidad</th>
            <th class="text-right">Precio Unitario</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${quote.items.map((item: any) => `
            <tr>
              <td>
                <strong>${item.product?.name || item.description}</strong>
                ${item.description ? `<br><small style="color: #6b7280;">${item.description}</small>` : ''}
              </td>
              <td class="text-center">${item.quantity}</td>
              <td class="text-right">$${item.price.toLocaleString('es-MX')}</td>
              <td class="text-right">$${item.total.toLocaleString('es-MX')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Totals -->
    <div class="section">
      <div class="totals">
        <div class="total-row">
          <strong>Subtotal:</strong>
          <span class="amount">$${subtotal.toLocaleString('es-MX')} MXN</span>
        </div>
        <div class="total-row">
          <strong>IVA (16%):</strong>
          <span class="amount">$${tax.toLocaleString('es-MX')} MXN</span>
        </div>
        <div class="total-row">
          <strong class="grand-total">Total:</strong>
          <span class="amount grand-total">$${grandTotal.toLocaleString('es-MX')} MXN</span>
        </div>
      </div>
    </div>

    <!-- Notes -->
    ${quote.notes ? `
    <div class="section">
      <div class="notes">
        <h4>Notas</h4>
        <p>${quote.notes}</p>
      </div>
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <p><strong>CotizaNet</strong> - Cotizaciones, pedidos y cobranza para PyMEs</p>
      <p>Esta cotización es válida por 30 días a partir de la fecha de emisión.</p>
      <p>Para cualquier duda o aclaración, contacte a su ejecutivo de ventas.</p>
    </div>
  </div>
</body>
</html>
  `
}

function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    draft: 'Borrador',
    sent: 'Enviada',
    accepted: 'Aceptada',
    rejected: 'Rechazada',
  }
  return statusMap[status] || status
}
