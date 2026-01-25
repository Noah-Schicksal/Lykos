/**
 * Converte tempo JWT (ex: '1h', '7d', '30m') para milissegundos
 */
const parseJwtTime = (time: string): number => {
  const units: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const match = time.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Formato de tempo inválido: ${time}`);
  }

  const [, value, unit] = match;
  return parseInt(value) * units[unit];
};

export const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
    maxAge: parseJwtTime(jwtExpiresIn), // Sincronizado com token
  };
};
