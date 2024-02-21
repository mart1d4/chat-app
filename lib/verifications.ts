export const usernameRegex =
    /^(?!.*[@#:]|.*\beveryone\b)(?!.*```)[\p{L}\p{M}\p{N}\p{Pd}\p{Pc}\p{Pc}\p{Pe}\p{Po}\p{Sm}\p{Sc}\p{Sk}\p{So}\p{Zs}\p{Zl}\p{Zp}]{2,32}$/u;

export const displayNameRegex =
    /^(?!.*[@#:]|.*\beveryone\b)(?!.*```)[\p{L}\p{M}\p{N}\p{Pd}\p{Pc}\p{Pc}\p{Pe}\p{Po}\p{Sm}\p{Sc}\p{Sk}\p{So}\p{Zs}\p{Zl}\p{Zp}]{2,32}$/u;

export const descriptionRegex = /^.{0,100}$/;

export const customStatusRegex = /^.{0,100}$/;

export const primaryColorRegex = /^#[0-9A-Fa-f]{6}$/;
export const accentColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const statusRegex = /^(online|idle|dnd|offline)$/;

export const passwordRegex = /^.{8,512}$/;

export const idRegex = /^\d{17,19}$/;

export const regexes = {
    id: idRegex,
    username: usernameRegex,
    password: passwordRegex,
    displayName: displayNameRegex,
    description: descriptionRegex,
    customStatus: customStatusRegex,
    primaryColor: primaryColorRegex,
    accentColor: accentColorRegex,
    status: statusRegex,
};
