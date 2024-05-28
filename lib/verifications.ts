export const usernameRegex =
    /^(?!.*[@#:]|.*\beveryone\b)(?!.*```)[\p{L}\p{M}\p{N}\p{Pd}\p{Pc}\p{Pc}\p{Pe}\p{Po}\p{Sm}\p{Sc}\p{Sk}\p{So}\p{Zs}\p{Zl}\p{Zp}]{2,32}$/u;

export const displayNameRegex = /^.{1,32}$/;

export const descriptionRegex = /^.{0,100}$/;

export const customStatusRegex = /^.{0,100}$/;

export const colorRegex = /^#[0-9A-Fa-f]{6}$/;

export const statusRegex = /^(online|idle|dnd|offline|invisible)$/;

export const passwordRegex = /^.{6,72}$/;

export const idRegex = /^\d{14,14}$/;

export const regexes = {
    id: idRegex,
    username: usernameRegex,
    password: passwordRegex,
    displayName: displayNameRegex,
    description: descriptionRegex,
    customStatus: customStatusRegex,
    primaryColor: colorRegex,
    accentColor: colorRegex,
    status: statusRegex,
};

export const validInviteChannelTypes = [1, 2, 3];

export function isFileImage(mime: string) {
    return mime.startsWith("image/");
}
