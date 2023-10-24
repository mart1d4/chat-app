export const usernameRegex =
    /^(?!.*[@#:]|.*\beveryone\b)(?!.*```)[\p{L}\p{M}\p{N}\p{Pd}\p{Pc}\p{Pc}\p{Pe}\p{Po}\p{Sm}\p{Sc}\p{Sk}\p{So}\p{Zs}\p{Zl}\p{Zp}]{2,32}$/u;

export const passwordRegex = /^.{8,256}$/;

export const idRegex = /^\d{17,19}$/;
