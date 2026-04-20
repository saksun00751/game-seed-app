export type RegisterClientVariant = "register" | "registerWithUsername";

const DEFAULT_REGISTER_CLIENT: RegisterClientVariant = "register";

function normalizeRegisterClient(value: string | undefined | null): RegisterClientVariant {
  if (value === "registerWithUsername") return "registerWithUsername";
  if (value === "register") return "register";
  return DEFAULT_REGISTER_CLIENT;
}

export function getRegisterClientVariant(): RegisterClientVariant {
  return normalizeRegisterClient(
    process.env.NEXT_PUBLIC_REGISTER_CLIENT
      ?? process.env.REGISTER_CLIENT
      ?? process.env.NEXT_PUBLIC_REGISTER_PAGE
      ?? process.env.REGISTER_PAGE,
  );
}

export function getRegisterPageSegment(): RegisterClientVariant {
  return getRegisterClientVariant();
}

export function getRegisterPagePath(locale: string): string {
  return `/${locale}/register`;
}
