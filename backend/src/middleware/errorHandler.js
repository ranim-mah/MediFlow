const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erreur serveur';
  let details = err.details || null;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Erreur de validation';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern)[0];
    message = `Valeur déjà utilisée pour le champ : ${field}`;
    details = { field, value: err.keyValue[field] };
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `ID invalide : ${err.value}`;
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Route introuvable : ${req.originalUrl}` });
};

module.exports = { errorHandler, notFound };
