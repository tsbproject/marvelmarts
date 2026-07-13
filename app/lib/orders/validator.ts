import { NIGERIAN_STATES } from "./constants";

export function validateEmail(
  value: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

export function validateName(
  value: string
) {
  return (
    value.length >= 2 &&
    value.length <= 50
  );
}

export function validatePhone(
  value: string
) {
  const digits =
    value.replace(/\D/g, "");

  return (
    digits.length >= 10 &&
    digits.length <= 15
  );
}

export function validateAddress(
  value: string
) {
  return (
    value.length >= 5 &&
    value.length <= 150
  );
}

export function validateCity(
  value: string
) {
  return (
    value.length >= 2 &&
    value.length <= 60
  );
}

export function validateState(
  value: string
) {
  return NIGERIAN_STATES.has(
    value
  );
}

export function parsePositiveInt(
  value: unknown
) {
  const n = Number(value);

  return Number.isInteger(n) &&
    n > 0
    ? n
    : null;
}

export function parseMoney(
  value: unknown
) {
  const n = Number(value);

  return Number.isFinite(n) &&
    n >= 0
    ? n
    : null;
}