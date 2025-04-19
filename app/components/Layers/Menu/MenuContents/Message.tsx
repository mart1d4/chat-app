"use client";

import { useEmojiPicker, useMostUsedEmojis, useTriggerDialog, useWindowSettings } from "@/store";
import { Menu, MenuContent, MenuDivider, MenuItem, MenuTrigger, useMenuContext } from "../Menu";
import type { Attachment, DMChannel, GuildChannel, ResponseMessage, UserGuild } from "@/type";
import type { MessageFunctions } from "@/app/components/Message/Message";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { isInline as isMessageInline } from "@/lib/message";
import { usePermissions } from "@/hooks/usePermissions";
import { getNamesFromCode } from "@/lib/emojis";
import { useRequests } from "@/hooks/useRequests";

export function MessageMenuContent({
    message,
    channel,
    guild,
    functions,
    attachment,
    attachmentFunctions,
}: {
    message: ResponseMessage;
    channel: DMChannel | GuildChannel;
    guild?: UserGuild;
    functions: MessageFunctions;
    attachment?: Attachment;
    attachmentFunctions?: {
        copyImage: () => void;
        saveImage: () => void;
        copyLink: () => void;
        openLink: () => void;
    };
}) {
    const shift = useWindowSettings((s) => s.shiftKeyDown);
    const { setData: setEmojiPicker } = useEmojiPicker();
    const { triggerDialog } = useTriggerDialog();
    const { removeAllReactions } = useRequests();
    const { emojis } = useMostUsedEmojis();
    const appUser = useAuthenticatedUser();
    const { setOpen } = useMenuContext();

    const hasVoice = !!message.attachments.find((a) => a.voiceMessage);
    const isInline = isMessageInline(message.type);
    const isDM = [0, 1].includes(channel.type);

    const isAuthor = message.author.id === appUser.id;
    const isPinnedMessage = message.type === 7;

    const { hasPermission } = usePermissions({ guildId: guild?.id });

    const canDelete =
        (isAuthor ||
            (isDM
                ? false
                : hasPermission({
                      permission: "MANAGE_MESSAGES",
                      specificChannelId: channel.id,
                  }))) &&
        (!isInline || isPinnedMessage);

    const canRemoveAllReactions =
        hasPermission({
            permission: "MANAGE_MESSAGES",
            specificChannelId: channel.id,
        }) &&
        !isDM &&
        !!message.reactions.length;

    const canPin =
        (hasPermission({
            permission: "MANAGE_MESSAGES",
            specificChannelId: channel.id,
        }) ||
            isDM) &&
        !isInline;

    const canReact =
        hasPermission({
            permission: "ADD_REACTIONS",
            specificChannelId: channel.id,
        }) || isDM;

    const canSendMessage =
        hasPermission({
            permission: "SEND_MESSAGES",
            specificChannelId: channel.id,
        }) || isDM;

    const hasText = message.content?.length > 0;

    return (
        <MenuContent>
            {canReact && (
                <Menu
                    gap={12}
                    openOnHover
                    openOnFocus
                    flipMainAxis
                    placement="right-start"
                >
                    <MenuTrigger>
                        <div>
                            <MenuItem submenu>Add Reaction</MenuItem>
                        </div>
                    </MenuTrigger>

                    <MenuContent>
                        {emojis.slice(0, 12).map((code) => (
                            <MenuItem
                                key={code}
                                onClick={() => {
                                    functions.addReaction(code);
                                    setOpen(false);
                                }}
                            >
                                {getNamesFromCode(code)![0]}
                                <img
                                    alt={getNamesFromCode(code)![0]}
                                    src={`/assets/emojis/${code}.svg`}
                                    style={{ width: "18px", height: "18px" }}
                                />
                            </MenuItem>
                        ))}

                        <MenuDivider />

                        <MenuItem
                            icon="emoji"
                            onClick={() => {
                                setEmojiPicker({
                                    open: true,
                                    placement: "left-start",
                                    container: document.getElementById(
                                        `emoji-picker-${message.id}`
                                    ),
                                    onClick: (code) => functions.addReaction(code),
                                });
                                setOpen(false);
                            }}
                        >
                            View More
                        </MenuItem>
                    </MenuContent>
                </Menu>
            )}

            {!!message.reactions.length && (
                <MenuItem
                    icon="emoji"
                    onClick={() => {
                        triggerDialog({
                            type: "VIEW_REACTIONS",
                            data: { message, functions },
                        });
                        setOpen(false);
                    }}
                >
                    View Reactions
                </MenuItem>
            )}

            {(canReact || !!message.reactions.length) && <MenuDivider />}

            {isAuthor && !isInline && !hasVoice && (
                <MenuItem
                    icon="edit"
                    onClick={() => {
                        functions.startEditingMessage();
                        setOpen(false);
                    }}
                >
                    Edit Message
                </MenuItem>
            )}

            {canSendMessage && (
                <MenuItem
                    icon="reply"
                    onClick={() => {
                        functions.setReplyToMessage();
                        setOpen(false);
                    }}
                >
                    Reply
                </MenuItem>
            )}

            {(canSendMessage || (isAuthor && !isInline && !hasVoice)) && <MenuDivider />}

            {hasText && (
                <MenuItem
                    icon="copy"
                    onClick={() => {
                        functions.copyMessageContent();
                        setOpen(false);
                    }}
                >
                    Copy Text
                </MenuItem>
            )}

            {canPin && (
                <MenuItem
                    icon="pin"
                    onClick={() => {
                        triggerDialog({
                            type: message.pinned ? "UNPIN_MESSAGE" : "PIN_MESSAGE",
                            data: { message, channel, functions },
                        });
                        setOpen(false);
                    }}
                >
                    {message.pinned ? "Unpin Message" : "Pin Message"}
                </MenuItem>
            )}

            <MenuItem
                icon="mark"
                onClick={() => {
                    console.log("Not implemented");
                    setOpen(false);
                }}
            >
                Mark Unread
            </MenuItem>

            <MenuItem
                icon="link"
                onClick={() => {
                    functions.copyMessageLink();
                    setOpen(false);
                }}
            >
                Copy Message Link
            </MenuItem>

            {hasText && (
                <MenuItem
                    icon="speak"
                    onClick={() => {
                        functions.speakMessageContent();
                        setOpen(false);
                    }}
                >
                    Speak Message
                </MenuItem>
            )}

            {hasText && (
                <MenuItem
                    icon="translate"
                    onClick={() => {
                        functions.translateMessageContent();
                        setOpen(false);
                    }}
                >
                    Translate Message
                </MenuItem>
            )}

            <MenuDivider />

            {canRemoveAllReactions && (
                <MenuItem
                    danger
                    onClick={() => {
                        if (shift) {
                            removeAllReactions.send({
                                channelId: channel.id,
                                messageId: message.id,
                            });
                        } else {
                            triggerDialog({
                                type: "REMOVE_REACTIONS",
                                data: {
                                    channelId: channel.id,
                                    messageId: message.id,
                                },
                            });
                        }

                        setOpen(false);
                    }}
                >
                    Remove All Reactions
                </MenuItem>
            )}

            {canDelete && (
                <MenuItem
                    danger
                    icon="delete"
                    onClick={() => {
                        if (shift) {
                            functions.deleteMessage();
                        } else {
                            triggerDialog({
                                type: "DELETE_MESSAGE",
                                data: { message, functions },
                            });
                        }
                        setOpen(false);
                    }}
                >
                    Delete Message
                </MenuItem>
            )}

            {!isAuthor && (
                <MenuItem
                    danger
                    icon="flag"
                >
                    Report Message
                </MenuItem>
            )}

            {(canDelete || !isAuthor || canRemoveAllReactions) && <MenuDivider />}

            {attachment && attachmentFunctions && (
                <>
                    <MenuItem onClick={attachmentFunctions.copyImage}>Copy Image</MenuItem>
                    <MenuItem onClick={attachmentFunctions.saveImage}>Save Image</MenuItem>

                    <MenuDivider />

                    <MenuItem onClick={attachmentFunctions.copyLink}>Copy Link</MenuItem>
                    <MenuItem onClick={attachmentFunctions.openLink}>Open Link</MenuItem>

                    <MenuDivider />
                </>
            )}

            <MenuItem
                icon="id"
                onClick={() => {
                    functions.copyMessageId();
                    setOpen(false);
                }}
            >
                Copy Message ID
            </MenuItem>
        </MenuContent>
    );
}
