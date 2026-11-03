import 'react-native-get-random-values';

/** RFC 4122 v4 UUID, backed by the native crypto polyfill loaded by the app. */
export const newHabitId = (): string => {
  const crypto = (
    globalThis as typeof globalThis & {
      crypto: { getRandomValues: (bytes: Uint8Array) => Uint8Array };
    }
  ).crypto;
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  // eslint-disable-next-line no-bitwise -- UUID version field occupies these bits.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // eslint-disable-next-line no-bitwise -- UUID variant field occupies these bits.
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, byte =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
