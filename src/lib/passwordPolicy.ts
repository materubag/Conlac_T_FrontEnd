export function newPasswordError(password: string): string | null {
  if (password.length < 8 || password.length > 128) return "La nueva contraseña debe tener entre 8 y 128 caracteres.";
  if (!/\p{L}/u.test(password) || !/\d/.test(password)) return "La nueva contraseña debe incluir al menos una letra y un número.";
  return null;
}
