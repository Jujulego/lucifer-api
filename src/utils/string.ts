// Constants
const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// Utils
export function randomString(length: number, alphabet: string = ALPHABET): string {
  const max = alphabet.length - 1;
  const result = [];

  for (let i = 0; i < length; ++i) {
    result.push(
      alphabet.charAt(Math.floor(Math.random() * max))
    )
  }

  return result.join('');
}
