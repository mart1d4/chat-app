"use client";

import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useData, useTriggerAlert, useTriggerDialog } from "@/store";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import type { GuildRole, Role, UserGuild } from "@/type";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { usePermissions } from "@/hooks/usePermissions";
import { useEffect, useMemo, useState } from "react";
import { useRequests } from "@/hooks/useRequests";
import { lowercaseContains } from "@/lib/strings";
import styles from "../../Settings.module.css";
import Image from "next/image";
import Link from "next/link";
import {
    getPermissionFlagFromBigint,
    guildPermissionList,
    removePermissions,
    addPermissions,
    hasPermission,
    combinePermissions,
} from "@/lib/permissions";
import {
    InteractiveElement,
    TooltipContent,
    TooltipTrigger,
    LoadingDots,
    MenuContent,
    MenuDivider,
    MenuTrigger,
    MenuItem,
    Tooltip,
    Avatar,
    Input,
    Icon,
    Menu,
} from "@components";
import { earthquake } from "@/lib/misc";

export function Roles({ guildId, ...props }: { guildId: number }) {
    const guild = useData((state) => state.guilds.find((g) => g.id === guildId));
    if (!guild) return null;

    const [roles, setRoles] = useState<GuildRole[]>(
        guild.roles.filter((r) => r.name !== "@everyone")
    );

    const [current, setCurrent] = useState<{
        role: GuildRole;
        tab: "Display" | "Permissions" | "Manage Members";
    } | null>(null);

    const [activeId, setActiveId] = useState<number | null>(null);
    const [shouldSwitchTo, setShouldSwitchTo] = useState(false);
    const [search, setSearch] = useState("");

    const [permissionSearch, setPermissionSearch] = useState("");

    const { hasPermission: hasPerm } = usePermissions({ guildId });
    const { createGuildRole, updateGuildRole } = useRequests();
    const { triggerAlert } = useTriggerAlert();
    const me = useAuthenticatedUser();

    const isAdmin = hasPerm({ permission: "ADMINISTRATOR" });
    const isOwner = me.id === guild.ownerId;

    const member = useMemo(() => {
        return guild.members.find((m) => m.id === me.id);
    }, [guild.members, me.id]);

    const myRoles = useMemo(() => {
        if (!member) return [];

        const roles = guild.roles
            .filter((r) => !r.everyone)
            .filter((r) => {
                return member.roles.includes(r.id);
            });

        return roles;
    }, [guild.roles, member]);

    const highestRole = useMemo(() => {
        if (!member) return null;
        return myRoles.sort((a, b) => a.position - b.position)[0];
    }, [myRoles, member]);

    const myMaxPermissions = useMemo(() => {
        return combinePermissions(myRoles.map((r) => r.permissions));
    }, [myRoles]);

    useEffect(() => {
        const newRoles = guild.roles
            .map((r) => ({
                ...r,
                hidden: !lowercaseContains(r.name, search),
            }))
            .sort((a, b) => a.position - b.position);

        setRoles(newRoles);
    }, [search, guild.roles]);

    useEffect(() => {
        const newRole = guild.roles.find((r) => r.id === shouldSwitchTo);

        if (newRole) {
            setCurrent((prev) => ({
                tab: prev?.tab ?? "Display",
                role: newRole,
            }));

            setShouldSwitchTo(false);
        }
    }, [guild.roles, shouldSwitchTo]);

    function handleDragEnd(event: any) {
        setActiveId(null);

        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const activeIndex = roles.findIndex((r) => r.id === active.id);
        const overIndex = roles.findIndex((r) => r.id === over.id);

        const newRoles = [...roles];
        newRoles.splice(activeIndex, 1);
        newRoles.splice(overIndex, 0, roles[activeIndex]);

        const movedRole = roles[activeIndex];
        const newPosition = newRoles.findIndex((r) => r.id === movedRole.id);

        console.log("Moved role", movedRole, "to position", newPosition);

        updateGuildRole.send(
            {
                guildId: guild!.id,
                roleId: movedRole.id,
                updates: {
                    position: newPosition,
                },
            },
            {
                onComplete: () => {
                    setRoles(newRoles);
                },
                onFail: () => {
                    triggerAlert("error", "Failed to move role");
                },
            }
        );
    }

    const isRoleDifferent = useMemo(() => {
        if (!current) return false;
        const role = guild.roles.find((r) => r.id === current.role.id);
        if (!role) return false;

        return (
            role.name !== current.role.name ||
            role.color !== current.role.color ||
            role.position != current.role.position ||
            role.permissions != current.role.permissions ||
            role.everyone != current.role.everyone ||
            role.hoist != current.role.hoist ||
            role.mentionable != current.role.mentionable
        );
    }, [current, guild.roles]);

    useEffect(() => {
        if (current?.tab !== "Permissions" && current?.role.everyone) {
            setCurrent({
                ...current,
                tab: "Permissions",
            });
        }
    }, [current]);

    useEffect(() => {
        if (current && !guild.roles.find((r) => r.id === current.role.id)) {
            setCurrent(null);
        }
    }, [current, guild.roles]);

    const noSearchResults = useMemo(() => {
        if (!permissionSearch) return false;

        const hasResults = guildPermissionList.some((category) =>
            category.permissions.some((permission) =>
                lowercaseContains(permission.name, permissionSearch)
            )
        );

        return !hasResults;
    }, [permissionSearch]);

    const currentRoleHigher = useMemo(() => {
        if (!current) return false;
        const role = guild.roles.find((r) => r.id === current.role.id);
        if (!role) return false;

        return !!highestRole && highestRole.position >= role.position;
    }, [current, guild.roles, highestRole]);

    const variants = {
        enter: {
            y: 0, // Starts at the final position
            transition: {
                type: "spring",
                stiffness: 500,
                damping: 30,
            },
        },
        exit: {
            y: [0, -40, 1000], // Moves up slightly, then plunges down
            transition: {
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1], // Snappy easing
            },
        },
        initial: {
            y: 250, // Starts off-screen at the bottom
        },
    };

    if (current) {
        return (
            <>
                <AnimatePresence>
                    {isRoleDifferent && (
                        <motion.div
                            className={styles.saveAlert}
                            variants={variants}
                            initial="initial"
                            animate="enter"
                            exit="exit"
                        >
                            <p>Careful — you have unsaved changes!</p>

                            <div>
                                <button
                                    type="button"
                                    className="button regular underline"
                                    onClick={() => {
                                        setCurrent({
                                            role: guild.roles.find(
                                                (r) => r.id === current.role.id
                                            ) as GuildRole,
                                            tab: current.tab,
                                        });
                                    }}
                                >
                                    Reset
                                </button>

                                <button
                                    className="button regular green"
                                    disabled={updateGuildRole.isLoading}
                                    onClick={() => {
                                        let updates = {
                                            ...current.role,
                                            id: undefined,
                                            everyone: undefined,
                                            position: undefined,
                                            permissions: current.role.permissions.toString(),
                                        };

                                        if (current.role.everyone) {
                                            updates = {
                                                permissions: current.role.permissions.toString(),
                                            };
                                        }

                                        updateGuildRole.send({
                                            guildId: guild.id,
                                            roleId: current.role.id,
                                            updates,
                                        });
                                    }}
                                >
                                    {updateGuildRole.isLoading ? <LoadingDots /> : "Save Changes"}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <section className="flex scrollbar ml-[-40px]">
                    <section className="w-[232px] h-dvh absolute top-0 left-0 border-r-1 border-solid border-(--border-2)">
                        <aside className={styles.roleEditAside}>
                            <div>
                                <InteractiveElement onClick={() => setCurrent(null)}>
                                    <Icon name="back" />
                                    <p>BACK</p>
                                </InteractiveElement>

                                <Tooltip>
                                    <TooltipTrigger>
                                        <button
                                            onClick={() => {
                                                createGuildRole.send(
                                                    { guildId: guild.id },
                                                    {
                                                        onComplete: ({ roleId }) => {
                                                            setShouldSwitchTo(roleId);
                                                        },
                                                    }
                                                );
                                            }}
                                        >
                                            <Icon
                                                size={20}
                                                name="add"
                                            />
                                        </button>
                                    </TooltipTrigger>

                                    <TooltipContent>Create Role</TooltipContent>
                                </Tooltip>
                            </div>

                            <ol className={`${styles.roleList} scrollbar`}>
                                {roles.map((role) => {
                                    const isHigher = highestRole
                                        ? role.position <= highestRole.position
                                        : true;

                                    return (
                                        <Menu
                                            key={role.id}
                                            positionOnClick
                                            openOnRightClick
                                            placement="right-start"
                                        >
                                            <MenuTrigger>
                                                <InteractiveElement
                                                    element="li"
                                                    onClick={() => {
                                                        if (current?.role.id === role.id) return;
                                                        setCurrent({
                                                            role,
                                                            tab: role.everyone
                                                                ? "Permissions"
                                                                : current.tab,
                                                        });
                                                    }}
                                                    className={
                                                        role.id === current.role.id
                                                            ? styles.active
                                                            : ""
                                                    }
                                                >
                                                    <div
                                                        className={styles.roleColor}
                                                        style={{
                                                            backgroundColor:
                                                                role.color || "#99AAB5",
                                                        }}
                                                    />

                                                    {isHigher && !isOwner && (
                                                        <span className="text-(--fg-3) mb-0.5 ml-[-2px]">
                                                            <Icon
                                                                size={16}
                                                                name="lock"
                                                            />
                                                        </span>
                                                    )}

                                                    <p>{role.name}</p>
                                                </InteractiveElement>
                                            </MenuTrigger>

                                            <RoleMenu
                                                role={role}
                                                guildId={guild.id}
                                                canDelete={!isHigher || isOwner}
                                            />
                                        </Menu>
                                    );
                                })}
                            </ol>
                        </aside>
                    </section>

                    <section className="absolute top-0 left-[232px] h-dvh overflow-y-scroll scrollbar max-h-dvh w-[calc(100%-232px)]">
                        <div className="max-w-[508px] min-w-[228px] pl-6 pr-[42px]">
                            <div className={styles.roleEditHeader}>
                                <div>
                                    <p>Edit role - {current.role.name}</p>

                                    <Menu
                                        positionOnClick
                                        placement="right-start"
                                    >
                                        <MenuTrigger>
                                            <button className="cursor-pointer">
                                                <Icon name="dots" />
                                            </button>
                                        </MenuTrigger>

                                        <RoleMenu
                                            guildId={guild.id}
                                            role={current.role}
                                            canDelete={!currentRoleHigher || isOwner}
                                        />
                                    </Menu>
                                </div>

                                <nav>
                                    <ul className={styles.roleEditTabs}>
                                        {["Display", "Permissions", "Manage Members"].map((tab) => (
                                            <InteractiveElement
                                                key={tab}
                                                element="li"
                                                onClick={() => {
                                                    if (current.role.everyone) return;
                                                    setCurrent({
                                                        ...current,
                                                        tab: tab as any,
                                                    });
                                                }}
                                                className={`${
                                                    current.tab === tab ? styles.active : ""
                                                } ${
                                                    current.role.everyone && tab !== "Permissions"
                                                        ? styles.disabled
                                                        : ""
                                                }`}
                                            >
                                                <p>{tab}</p>
                                            </InteractiveElement>
                                        ))}
                                    </ul>
                                </nav>

                                {current.tab === "Permissions" && (
                                    <Input
                                        hideLabel
                                        size="small"
                                        label="Role Name"
                                        value={permissionSearch}
                                        placeholder="Search permissions"
                                        onChange={(v) => setPermissionSearch(v)}
                                        rightItem={
                                            permissionSearch.length ? (
                                                <button onClick={() => setPermissionSearch("")}>
                                                    <Icon
                                                        size={18}
                                                        name="cross"
                                                    />
                                                </button>
                                            ) : (
                                                <Icon
                                                    size={18}
                                                    name="search"
                                                />
                                            )
                                        }
                                    />
                                )}
                            </div>

                            {current.tab === "Display" && (
                                <div>
                                    <div className={styles.roleName}>
                                        <Input
                                            required
                                            label="Role Name"
                                            value={current.role.name}
                                            placeholder="Role Name"
                                            onChange={(v) => {
                                                setCurrent({
                                                    ...current,
                                                    role: {
                                                        ...current.role,
                                                        name: v,
                                                    },
                                                });
                                            }}
                                        />
                                    </div>

                                    <div className={styles.roleColors}>
                                        <div>
                                            Role Color <span>*</span>
                                        </div>
                                        <p>
                                            Members use the color of the highest role they have on
                                            the roles list.
                                        </p>

                                        <section>
                                            <Tooltip placement="bottom">
                                                <TooltipTrigger>
                                                    <button
                                                        onClick={() => {
                                                            setCurrent({
                                                                ...current,
                                                                role: {
                                                                    ...current.role,
                                                                    color: null,
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        {current.role.color === null && (
                                                            <Icon name="checkmark" />
                                                        )}
                                                    </button>
                                                </TooltipTrigger>

                                                <TooltipContent>Default</TooltipContent>
                                            </Tooltip>

                                            <Tooltip placement="bottom">
                                                <TooltipTrigger>
                                                    <button>
                                                        <Icon
                                                            size={14}
                                                            name="edit"
                                                        />
                                                    </button>
                                                </TooltipTrigger>

                                                <TooltipContent>Custom Color</TooltipContent>
                                            </Tooltip>

                                            <ul>
                                                {[
                                                    "#1ABC9C",
                                                    "#2ECC71",
                                                    "#3498DB",
                                                    "#9B59B6",
                                                    "#E91E63",
                                                    "#F1C40F",
                                                    "#E67E22",
                                                    "#E74C3C",
                                                    "#95A5A6",
                                                    "#607D8B",
                                                    "#11806A",
                                                    "#1F8B4C",
                                                    "#206694",
                                                    "#71368A",
                                                    "#AD1457",
                                                    "#C27C0E",
                                                    "#A84300",
                                                    "#992D22",
                                                    "#979C9F",
                                                    "#546E7A",
                                                ].map((color) => (
                                                    <InteractiveElement
                                                        key={color}
                                                        element="li"
                                                        style={{ backgroundColor: color }}
                                                        onClick={() => {
                                                            setCurrent({
                                                                ...current,
                                                                role: {
                                                                    ...current.role,
                                                                    color,
                                                                },
                                                            });
                                                        }}
                                                    >
                                                        {color === current.role.color && (
                                                            <Icon
                                                                size={14}
                                                                name="checkmark"
                                                            />
                                                        )}
                                                    </InteractiveElement>
                                                ))}
                                            </ul>
                                        </section>
                                    </div>

                                    <div className={styles.roleColorPreview}>
                                        <section>
                                            {["--fg-0", "--bg-4", "--bg-1", "--bg-7"].map(
                                                (_, i) => (
                                                    <div
                                                        key={_}
                                                        style={{
                                                            backgroundColor: `var(${_})`,
                                                        }}
                                                        className={`${styles.messagePreview} ${
                                                            i === 0 ? styles.first : ""
                                                        }`}
                                                    >
                                                        <div>
                                                            <Avatar
                                                                size={40}
                                                                type="user"
                                                                alt="Sparklet"
                                                                generateId={1}
                                                            />

                                                            <h2>
                                                                <span
                                                                    style={{
                                                                        color:
                                                                            current.role.color ||
                                                                            "",
                                                                    }}
                                                                >
                                                                    No Bark
                                                                </span>
                                                                <span>9:59 PM</span>
                                                            </h2>

                                                            <p>rocks are really old</p>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </section>
                                    </div>

                                    <div className={styles.rolePermItem}>
                                        <Input
                                            type="checkbox"
                                            value={current.role.hoist}
                                            label="Display role members separately from online members"
                                            onChange={() => {
                                                setCurrent({
                                                    ...current,
                                                    role: {
                                                        ...current.role,
                                                        hoist: !current.role.hoist,
                                                    },
                                                });
                                            }}
                                        />

                                        <div />
                                    </div>

                                    <div className={styles.rolePermItem}>
                                        <Input
                                            type="checkbox"
                                            value={current.role.mentionable}
                                            label="Allow anyone to @mention this role"
                                            onChange={() => {
                                                setCurrent({
                                                    ...current,
                                                    role: {
                                                        ...current.role,
                                                        mentionable: !current.role.mentionable,
                                                    },
                                                });
                                            }}
                                        />

                                        <p>
                                            Members with the "Mention @everyone, @here, and All
                                            Roles" permission will always be able to ping this role.
                                        </p>

                                        <div />
                                    </div>
                                </div>
                            )}

                            {current.tab === "Permissions" && (
                                <div className="relative">
                                    <button
                                        className="absolute top-[-4px] right-0 text-(--accent-fg) text-sm font-medium cursor-pointer underline"
                                        disabled={
                                            currentRoleHigher || current.role.permissions == 0n
                                        }
                                        onClick={() => {
                                            setCurrent({
                                                ...current,
                                                role: {
                                                    ...current.role,
                                                    permissions: 0n,
                                                },
                                            });
                                        }}
                                    >
                                        Clear permissions
                                    </button>

                                    {guildPermissionList.map((category) => {
                                        const shouldHideTitle = category.permissions.every(
                                            (permission) => {
                                                return !lowercaseContains(
                                                    permission.name,
                                                    permissionSearch
                                                );
                                            }
                                        );

                                        return (
                                            <section key={category.title}>
                                                <h2
                                                    className={styles.rolePermTitle}
                                                    style={{
                                                        display: shouldHideTitle
                                                            ? "none"
                                                            : undefined,
                                                    }}
                                                >
                                                    {category.title}
                                                </h2>

                                                <ol>
                                                    {category.permissions.map((permission) => {
                                                        const isSearched = lowercaseContains(
                                                            permission.name,
                                                            permissionSearch
                                                        );

                                                        const isChecked = hasPermission(
                                                            current.role.permissions,
                                                            permission.permission
                                                        );

                                                        const cantUpdate =
                                                            !hasPermission(
                                                                myMaxPermissions,
                                                                permission.permission
                                                            ) &&
                                                            !isAdmin &&
                                                            !isOwner;

                                                        return (
                                                            <li
                                                                key={permission.name}
                                                                className={`${
                                                                    styles.rolePermItem
                                                                } ${
                                                                    cantUpdate || currentRoleHigher
                                                                        ? "cursor-not-allowed opacity-50"
                                                                        : ""
                                                                }`}
                                                                style={{
                                                                    display: isSearched
                                                                        ? "flex"
                                                                        : "none",
                                                                }}
                                                            >
                                                                <div className="flex gap-2 items-center">
                                                                    {cantUpdate && (
                                                                        <Tooltip>
                                                                            <TooltipTrigger>
                                                                                <div>
                                                                                    <Icon
                                                                                        size={18}
                                                                                        name="stop-sign"
                                                                                    />
                                                                                </div>
                                                                            </TooltipTrigger>

                                                                            <TooltipContent>
                                                                                You cannot modify
                                                                                this permission
                                                                                because none of your
                                                                                roles have it.
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    )}

                                                                    <div className="grow">
                                                                        <Input
                                                                            type="checkbox"
                                                                            value={isChecked}
                                                                            label={permission.name}
                                                                            disabled={
                                                                                cantUpdate ||
                                                                                currentRoleHigher
                                                                            }
                                                                            onChange={() => {
                                                                                const perm =
                                                                                    getPermissionFlagFromBigint(
                                                                                        permission.permission
                                                                                    );
                                                                                if (!perm) return;

                                                                                let newPerm;

                                                                                if (isChecked) {
                                                                                    newPerm =
                                                                                        removePermissions(
                                                                                            current
                                                                                                .role
                                                                                                .permissions,
                                                                                            [perm]
                                                                                        );
                                                                                } else {
                                                                                    newPerm =
                                                                                        addPermissions(
                                                                                            current
                                                                                                .role
                                                                                                .permissions,
                                                                                            [perm]
                                                                                        );
                                                                                }

                                                                                setCurrent({
                                                                                    ...current,
                                                                                    role: {
                                                                                        ...current.role,
                                                                                        permissions:
                                                                                            newPerm,
                                                                                    },
                                                                                });
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <p>{permission.description}</p>

                                                                <div />
                                                            </li>
                                                        );
                                                    })}
                                                </ol>
                                            </section>
                                        );
                                    })}

                                    {noSearchResults && (
                                        <div className={styles.noResults}>
                                            <Image
                                                width={85}
                                                height={85}
                                                alt="No results"
                                                src="/assets/system/nothing-found.svg"
                                            />

                                            <p>No permissions found</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                </section>
            </>
        );
    }

    const hasNoRoles = roles.filter((r) => !r.everyone).length === 0;

    return (
        <section>
            <div className={`${styles.sectionTitle} ${styles.roleTitle}`}>
                <h2>Roles</h2>

                <p className={hasNoRoles ? "hidden" : ""}>
                    Use roles to group your server members and assign permissions.
                </p>
            </div>

            {hasNoRoles && (
                <div className="flex flex-col items-center justify-center mt-7 mb-7 pb-7 border-b-1 border-b-(--border-1)">
                    <h3 className="title text-2xl">Organize your members</h3>

                    <p className="text-(--fg-2) mt-1">
                        Use roles to group your server members and assign permissions.
                    </p>

                    <button
                        className="button regular blue mt-6"
                        disabled={createGuildRole.isLoading}
                        onClick={() => {
                            createGuildRole.send(
                                { guildId: guild.id },
                                {
                                    onComplete: ({ roleId }) => {
                                        setShouldSwitchTo(roleId);
                                    },
                                }
                            );
                        }}
                    >
                        Create Role
                    </button>
                </div>
            )}

            <InteractiveElement
                element="div"
                className={styles.defaultRoleTab}
                onClick={() => {
                    setCurrent({
                        role: guild.roles.find((r) => !!r.everyone) as GuildRole,
                        tab: "Permissions",
                    });
                }}
            >
                <div>
                    <Icon
                        size={20}
                        name="users"
                    />
                </div>

                <div>
                    <h3>Default Permissions</h3>
                    <p>@everyone • applies to all server members</p>
                </div>

                <div>
                    <Icon name="caret" />
                </div>
            </InteractiveElement>

            <section className={`${styles.roleSearch} ${hasNoRoles ? "hidden" : ""}`}>
                <div>
                    <Input
                        hideLabel
                        size="small"
                        label="Roles"
                        value={search}
                        placeholder="Search roles"
                        onChange={(v) => setSearch(v)}
                        rightItem={
                            <Icon
                                size={18}
                                name="search"
                            />
                        }
                    />

                    <button
                        className="button regular blue"
                        disabled={createGuildRole.isLoading}
                        onClick={() => {
                            createGuildRole.send(
                                { guildId: guild.id },
                                {
                                    onComplete: ({ roleId }) => {
                                        setShouldSwitchTo(roleId);
                                    },
                                }
                            );
                        }}
                    >
                        {createGuildRole.isLoading ? <LoadingDots /> : "Create Role"}
                    </button>
                </div>

                <p>
                    Members use the color of the highest role they have on this list. Drag roles to
                    reorder them.{" "}
                    <Link
                        className="link"
                        href="/help/roles"
                    >
                        Need help with permissions?
                    </Link>
                </p>
            </section>

            <section className={hasNoRoles ? "hidden" : ""}>
                <div className={styles.listItemHeader}>
                    <div />
                    <div>Roles - {roles.length - 1}</div>
                    <div>Members</div>
                    <div />
                </div>

                <DndContext
                    onDragEnd={handleDragEnd}
                    onDragStart={(e) => setActiveId(e.active.id as number)}
                >
                    <SortableContext
                        items={roles}
                        strategy={verticalListSortingStrategy}
                    >
                        <ol>
                            {roles
                                .filter((r) => !r.everyone)
                                .map((role) => (
                                    <RoleItem
                                        role={role}
                                        guild={guild}
                                        key={role.id}
                                        isCurrentHighest={role.id === highestRole?.id}
                                        isHigher={
                                            highestRole
                                                ? role.position <= highestRole.position && !isOwner
                                                : !isOwner
                                        }
                                        showRole={(r, t) =>
                                            setCurrent({ role: r, tab: t || "Display" })
                                        }
                                    />
                                ))}
                        </ol>
                    </SortableContext>

                    <DragOverlay>
                        {activeId ? (
                            <RoleItem
                                isOverlay
                                guild={guild}
                                role={roles.find((r) => r.id === activeId)}
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </section>
        </section>
    );
}

function RoleItem({
    guild,
    role,
    isOverlay,
    showRole,
    isHigher,
    isCurrentHighest,
}: {
    guild: UserGuild;
    isOverlay?: boolean;
    showRole?: (r: Role, t?: "Display" | "Permissions" | "Manage Members") => void;
    role: GuildRole & { hidden?: boolean };
    isHigher?: boolean;
    isCurrentHighest?: boolean;
}) {
    if (role.hidden) return null;

    const { active, attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging, isOver } =
        useSortable({
            id: role.id,
            transition: null,
            disabled: isOverlay || isHigher,
        });

    return (
        <Menu
            positionOnClick
            openOnRightClick
            placement="right-start"
        >
            <RoleMenu
                role={role}
                guildId={guild.id}
                canDelete={!isHigher}
            />

            <MenuTrigger>
                <InteractiveElement
                    element="li"
                    ref={setNodeRef}
                    style={{
                        opacity: isOverlay ? 0.5 : undefined,
                        pointerEvents: active !== null ? "none" : undefined,
                        marginRight: isOverlay ? 0 : undefined,
                        marginLeft: isOverlay ? 0 : undefined,
                    }}
                    className={`${styles.listItemDraggable} ${isOver ? styles.over : ""} ${
                        isDragging ? styles.dragging : ""
                    }`}
                    onClick={() => {
                        if (showRole) {
                            showRole(role);
                        }
                    }}
                    {...attributes}
                >
                    {!isOverlay ? (
                        <div
                            ref={setActivatorNodeRef}
                            className={`${styles.dragger} ${isHigher ? "invisible!" : ""}`}
                            {...listeners}
                        >
                            <Icon
                                size={16}
                                name="dragger"
                            />
                        </div>
                    ) : (
                        <div className={`${styles.dragger} ${isHigher ? "invisible!" : ""}`} />
                    )}

                    <div>
                        <Icon
                            name="user-shield"
                            style={{ color: role.color }}
                        />

                        <p className="flex gap-1 items-center">
                            {isHigher && (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <span>
                                            <Icon
                                                size={16}
                                                name="lock"
                                                className="text-(--fg-4) mb-0.5"
                                            />
                                        </span>
                                    </TooltipTrigger>

                                    <TooltipContent>
                                        {isCurrentHighest
                                            ? "Role is locked because it is your highest ranked role. Please ask a higher rank or Server Owner for help."
                                            : "Role is locked because it is a higher rank than your highest role."}
                                    </TooltipContent>
                                </Tooltip>
                            )}

                            {role.name}
                        </p>
                    </div>

                    <Tooltip placement="right">
                        <TooltipTrigger>
                            <InteractiveElement
                                element="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (showRole) {
                                        showRole(role, "Manage Members");
                                    }
                                }}
                            >
                                <div>
                                    {guild.members.filter((m) => m.roles.includes(role.id)).length}
                                </div>

                                <Icon
                                    size={20}
                                    name="user"
                                />
                            </InteractiveElement>
                        </TooltipTrigger>

                        <TooltipContent>View Members</TooltipContent>
                    </Tooltip>

                    <div>
                        {!isOverlay && (
                            <Tooltip>
                                <TooltipTrigger>
                                    <button className="circle-button">
                                        <Icon
                                            size={20}
                                            name={isHigher ? "eye" : "edit"}
                                        />
                                    </button>
                                </TooltipTrigger>

                                <TooltipContent>{isHigher ? "View" : "Edit"}</TooltipContent>
                            </Tooltip>
                        )}

                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <Menu
                                openOnClick
                                positionOnClick
                                placement="right-start"
                            >
                                <Tooltip>
                                    <TooltipTrigger>
                                        <MenuTrigger>
                                            <button className="circle-button">
                                                <Icon
                                                    size={20}
                                                    name="dots"
                                                />
                                            </button>
                                        </MenuTrigger>
                                    </TooltipTrigger>

                                    <TooltipContent>More</TooltipContent>
                                </Tooltip>

                                <RoleMenu
                                    role={role}
                                    guildId={guild.id}
                                    canDelete={!isHigher}
                                />
                            </Menu>
                        </div>
                    </div>
                </InteractiveElement>
            </MenuTrigger>
        </Menu>
    );
}

function RoleMenu({
    role,
    guildId,
    canDelete,
}: {
    role: GuildRole;
    guildId: number;
    canDelete?: boolean;
}) {
    const { triggerDialog } = useTriggerDialog();
    const { triggerAlert } = useTriggerAlert();

    return (
        <MenuContent>
            <MenuItem
                icon="id"
                onClick={async () => {
                    try {
                        await navigator.clipboard.writeText(role.id);
                        triggerAlert("success", "ID copied to clipboard");
                    } catch (e) {
                        triggerAlert("error", "Failed to copy ID");
                    }
                }}
            >
                Copy ID
            </MenuItem>

            {!role.everyone && canDelete && (
                <>
                    <MenuDivider />

                    <MenuItem
                        danger
                        icon="delete"
                        onClick={() => {
                            triggerDialog({ type: "ROLE_DELETE", data: { role, guildId } });
                        }}
                    >
                        Delete
                    </MenuItem>
                </>
            )}
        </MenuContent>
    );
}
