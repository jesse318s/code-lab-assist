export function modulo(n, m) {
  // handle negative numbers
  return ((n % m) + m) % m;
}
