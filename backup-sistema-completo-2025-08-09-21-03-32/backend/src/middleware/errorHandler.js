const errorHandler = (err, req, res, next) => {
  console.error('Erro:', err);

  // Erro de validação do Prisma
  if (err.code === 'P2002') {
    return res.status(400).json({
      message: 'Dados duplicados. Verifique as informações enviadas.',
      field: err.meta?.target?.[0]
    });
  }

  // Erro de registro não encontrado
  if (err.code === 'P2025') {
    return res.status(404).json({
      message: 'Registro não encontrado.'
    });
  }

  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Dados inválidos.',
      errors: err.errors
    });
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Token inválido.'
    });
  }

  // Erro de JWT expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expirado.'
    });
  }

  // Erro padrão
  res.status(err.status || 500).json({
    message: err.message || 'Erro interno do servidor.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler }; 