export const ERROR_MESSAGES = {
  // Autenticación
  unauthorized: 'No tienes autorización para realizar esta acción',
  forbidden: 'No tienes permisos para realizar esta acción',
  
  // Credenciales
  invalidCredentials: 'Correo o contraseña incorrectos. Por favor verifica tus datos.',
  invalidEmail: 'Por favor ingresa un correo electrónico válido',
  passwordRequired: 'Por favor ingresa tu contraseña',
  emailRequired: 'Por favor ingresa tu correo electrónico',
  
  // Recursos no encontrados
  notFound: (resource: string) => `${resource} no encontrado`,
  companyNotFound: 'Empresa no encontrada',
  userNotFound: 'Usuario no encontrado',
  invoiceNotFound: 'Factura no encontrada',
  orderNotFound: 'Pedido no encontrado',
  quoteNotFound: 'Cotización no encontrada',
  customerNotFound: 'Cliente no encontrado',
  subscriptionNotFound: 'Suscripción no encontrada',
  leadNotFound: 'Lead no encontrado',
  
  // Validaciones
  required: (field: string) => `El campo ${field} es requerido`,
  invalidFormat: (field: string) => `El formato de ${field} no es válido`,
  
  // Estados
  alreadyPaid: 'Ya ha sido pagado anteriormente',
  alreadyDelivered: 'Ya ha sido entregado',
  alreadyCancelled: 'Ya ha sido cancelado',
  notDelivered: 'Solo se pueden generar facturas para pedidos entregados',
  alreadyExists: (resource: string) => `Ya existe un ${resource} con estos datos`,
  
  // Operaciones
  saveError: 'Error al guardar los cambios',
  updateError: 'Error al actualizar',
  deleteError: 'Error al eliminar',
  createError: 'Error al crear',
  sendError: 'Error al enviar',
  
  // Generic
  serverError: 'Hubo un problema. Por favor intenta de nuevo más tarde.',
  tryAgain: 'Por favor intenta de nuevo más tarde.',
}

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return ERROR_MESSAGES.serverError
}