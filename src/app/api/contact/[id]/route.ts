import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'El estado es requerido' },
        { status: 400 }
      )
    }

    // Validate status is a valid ContactMessageStatus
    const validStatuses = ['new', 'read', 'replied', 'archived']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      )
    }

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { status: status as 'new' | 'read' | 'replied' | 'archived' },
    })

    return NextResponse.json({
      success: true,
      message: 'Estado actualizado correctamente',
      data: message,
    })
  } catch (error) {
    console.error('Error updating contact message:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el mensaje' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.contactMessage.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Mensaje eliminado correctamente',
    })
  } catch (error) {
    console.error('Error deleting contact message:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el mensaje' },
      { status: 500 }
    )
  }
}
