export const memberHasPermission = (
    user: TCleanUser,
    guild: TGuild,
    permission: EPermissionType,
    overwrites?: TPermissionOverwrite
) => {
    return true;
};
