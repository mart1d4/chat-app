"use client";

import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { GuildRole, Role, UserGuild } from "@/type";
import { lowercaseContains } from "@/lib/strings";
import styles from "../../Settings.module.css";
import { useEffect, useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { useData } from "@/store";
import Link from "next/link";
import {
    InteractiveElement,
    TooltipContent,
    TooltipTrigger,
    Tooltip,
    Input,
    Icon,
} from "@components";
import { guildPermissionList, hasPermission } from "@/lib/permissions";

export function Roles({ guildId }: { guildId: number }) {
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
    const [search, setSearch] = useState("");

    const [permissionSearch, setPermissionSearch] = useState("");

    useEffect(() => {
        const newRoles = roles.map((r) => ({
            ...r,
            hidden: !lowercaseContains(r.name, search),
        }));

        setRoles(newRoles);
    }, [search]);

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

        setRoles(newRoles);
    }

    if (current) {
        return (
            <div className={styles.roleEditContainer}>
                <section>
                    <aside className={styles.roleEditAside}>
                        <div>
                            <InteractiveElement onClick={() => setCurrent(null)}>
                                <Icon name="back" />
                                <p>BACK</p>
                            </InteractiveElement>

                            <Tooltip>
                                <TooltipTrigger>
                                    <InteractiveElement>
                                        <Icon
                                            size={20}
                                            name="add"
                                        />
                                    </InteractiveElement>
                                </TooltipTrigger>

                                <TooltipContent>Create Role</TooltipContent>
                            </Tooltip>
                        </div>

                        <ol className={styles.roleList}>
                            {roles.map((role) => (
                                <InteractiveElement
                                    element="li"
                                    key={role.id}
                                    onClick={() => {
                                        setCurrent({
                                            role,
                                            tab: role.everyone ? "Permissions" : current.tab,
                                        });
                                    }}
                                    className={role.id === current.role.id ? styles.active : ""}
                                >
                                    <div
                                        className={styles.roleColor}
                                        style={{ backgroundColor: role.color }}
                                    />

                                    <p>{role.name}</p>
                                </InteractiveElement>
                            ))}
                        </ol>
                    </aside>
                </section>

                <section>
                    <div className={styles.roleEditHeader}>
                        <div>
                            <p>Edit role - {current.role.name}</p>
                            <Icon name="dots" />
                        </div>

                        <nav>
                            <ul className={styles.roleEditTabs}>
                                {["Display", "Permissions", "Manage Members"].map((tab) => (
                                    <InteractiveElement
                                        key={tab}
                                        element="li"
                                        onClick={() => {
                                            setCurrent({
                                                ...current,
                                                tab: tab as any,
                                            });
                                        }}
                                        className={current.tab === tab ? styles.active : ""}
                                    >
                                        <p>{tab}</p>
                                    </InteractiveElement>
                                ))}
                            </ul>
                        </nav>

                        <Input
                            hideLabel
                            size="small"
                            label="Role Name"
                            value={permissionSearch}
                            placeholder="Search permissions"
                            onChange={(v) => setPermissionSearch(v)}
                            rightItem={
                                <Icon
                                    size={18}
                                    name="search"
                                />
                            }
                        />
                    </div>

                    <div>
                        {guildPermissionList.map((category) => (
                            <section key={category.title}>
                                <h2 className={styles.rolePermTitle}>{category.title}</h2>

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

                                        return (
                                            <li
                                                key={permission.name}
                                                className={styles.rolePermItem}
                                                style={{ display: isSearched ? "flex" : "none" }}
                                            >
                                                <Input
                                                    noBox
                                                    type="checkbox"
                                                    label={permission.name}
                                                    checked={isChecked}
                                                    onChange={() => {
                                                        console.log("Change permission");
                                                    }}
                                                />

                                                <p>{permission.description}</p>

                                                <div />
                                            </li>
                                        );
                                    })}
                                </ol>
                            </section>
                        ))}
                    </div>
                </section>
            </div>
        );
    }

    return (
        <section>
            <div className={styles.sectionTitle}>
                <h2>Roles</h2>
                <p>Use roles to group your server members and assign permissions.</p>
            </div>

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
                    <Icon name="users" />
                </div>

                <div>
                    <h3>Default Permissions</h3>
                    <p>@everyone • applies to all server members</p>
                </div>

                <div>
                    <Icon name="caret" />
                </div>
            </InteractiveElement>

            <section className={styles.roleSearch}>
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

                    <button className="button blue">Create Role</button>
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

            <section>
                <div className={styles.listItemHeader}>
                    <div />
                    <div>Roles - {roles.length}</div>
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
                            {roles.map((role) => (
                                <RoleItem
                                    role={role}
                                    guild={guild}
                                    key={role.id}
                                />
                            ))}
                        </ol>
                    </SortableContext>

                    <DragOverlay>
                        {activeId ? (
                            <RoleItem
                                isOverlay
                                guild={guild}
                                role={roles.find((r) => r.id === activeId) as Role}
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
}: {
    guild: UserGuild;
    role: Role;
    isOverlay?: boolean;
}) {
    if (role.hidden) return null;

    const { active, attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging, isOver } =
        useSortable({
            id: role.id,
            transition: null,
            disabled: isOverlay,
        });

    return (
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
            {...attributes}
        >
            {!isOverlay ? (
                <div
                    ref={setActivatorNodeRef}
                    className={styles.dragger}
                    {...listeners}
                >
                    <Icon
                        size={16}
                        name="dragger"
                    />
                </div>
            ) : (
                <div className={styles.dragger} />
            )}

            <div>
                <Icon name="user-shield" />
                <p>{role.name}</p>
            </div>

            <Tooltip placement="right">
                <TooltipTrigger>
                    <InteractiveElement>
                        <div>{guild.members.filter((m) => m.roles.includes(role.id)).length}</div>

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
                                    name="edit"
                                />
                            </button>
                        </TooltipTrigger>

                        <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                )}

                <Tooltip>
                    <TooltipTrigger>
                        <button className="circle-button">
                            <Icon
                                size={20}
                                name="dots"
                            />
                        </button>
                    </TooltipTrigger>

                    <TooltipContent>More</TooltipContent>
                </Tooltip>
            </div>
        </InteractiveElement>
    );
}
