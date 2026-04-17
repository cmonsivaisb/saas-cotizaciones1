import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const leadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  businessType: z.string().min(2, 'Business type must be at least 2 characters'),
  message: z.string().optional(),
  source: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = leadSchema.parse(body)

    // Create lead
    const lead = await prisma.lead.create({
      data: {
        name: validatedData.name,
        businessName: validatedData.businessName,
        email: validatedData.email,
        phone: validatedData.phone,
        businessType: validatedData.businessType,
        message: validatedData.message,
        source: validatedData.source || 'Landing Page',
        status: 'new',
      },
    })

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        name: lead.name,
        businessName: lead.businessName,
      },
    })
  } catch (error) {
    console.error('Lead creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
