"use client";

import { Alert, Icon, Input, LoadingDots, useDialogContext } from "@components";
import { useAuthenticatedUser } from "@/hooks/useAuthenticatedUser";
import { Fragment, useEffect, useState } from "react";
import useFetchHelper from "@/hooks/useFetchHelper";
import { useUploadThing } from "@/lib/uploadthing";
import { useKeenSlider } from "keen-slider/react";
import styles from "./CreateGuild.module.css";

const types = [
    {
        name: "Create My Own",
        value: "own",
    },
    {
        name: "Gaming",
        value: "gaming",
    },
    {
        name: "School Club",
        value: "school",
    },
    {
        name: "Study Group",
        value: "study",
    },
    {
        name: "Friends",
        value: "friends",
    },
    {
        name: "Artists & Creators",
        value: "artists",
    },
    {
        name: "Local Community",
        value: "community",
    },
];

const whoForTypes = [
    {
        name: "For me and my friends",
        value: "friends",
    },
    {
        name: "For a club or community",
        value: "community",
    },
];

const slides = [
    [
        "Your server is where you and your friends hang out. Make yours and start talking.",
        "Create Your Server",
    ],
    [
        "In order to help you with your setup, is your new server for just a few friends or a larger community?",
        "Tell Us More About Your Server",
    ],
    [
        "Give your new server a personality with a name and an icon. You can always change these later.",
        "Customize Your Server",
    ],
    ["Enter an invite below to join an existing server", "Join a Server"],
];

const linkTypes = [
    "hTKzmak",
    "https://spark.mart1d4.dev/hTKzmak",
    "https://spark.mart1d4.dev/cool-people",
];

export function CreateGuild() {
    const { sendRequest } = useFetchHelper();
    const { setOpen } = useDialogContext();
    const user = useAuthenticatedUser();

    const [name, setName] = useState(`${user.username}'s server`);
    const [whoFor, setWhoFor] = useState<string | null>(null);
    const [type, setType] = useState<string | null>(null);
    const [icon, setIcon] = useState<File | null>(null);
    const [currentOld, setCurrentOld] = useState(0);
    const [loading, setLoading] = useState(false);
    const [current, setCurrent] = useState(0);
    const [invite, setInvite] = useState("");
    const [error, setError] = useState("");

    const { startUpload } = useUploadThing("imageUploader", {
        onClientUploadComplete: (files) => {
            const { key: fileId } = files[0];
            createServer(fileId);
        },
        onUploadError: (error) => {
            console.error(error);
            setLoading(false);
            setError("An error occured while uploading your avatar");
            setTimeout(() => setError(""), 5000);
        },
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

    const [sliderRef, instanceRef] = useKeenSlider({
        initial: 0,
        drag: false,
        defaultAnimation: {
            duration: 200,
            easing: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
        },
        created(s) {
            s.container.style.height = s.slides[s.track.details.abs].offsetHeight + "px";
        },
    });

    useEffect(() => {
        if (!instanceRef.current) return;
        const s = instanceRef.current;

        if (current !== currentOld) {
            if (currentOld === 1 && current === 0) {
                // To prevent layout shift
                setTimeout(() => {
                    setType(null);
                }, 200);
            }

            setCurrentOld(current);
            s.moveToIdx(current);
            s.container.style.height = s.slides[current].offsetHeight + "px";
        }
    }, [current, currentOld, instanceRef]);

    async function createServer(iconId: string | null = null) {
        if (loading && !iconId) return;

        setLoading(true);

        try {
            if (icon && !iconId) {
                startUpload([icon]);
                return;
            }

            const { errors } = await sendRequest({
                query: "GUILD_CREATE",
                body: {
                    name,
                    icon: iconId,
                },
            });

            if (!errors) {
                setOpen(false);
            } else if (errors) {
                console.error(errors);
                setError("An error occurred while creating the server.");
            }
        } catch (e) {
            console.error(e);
        }

        setLoading(false);
    }

    async function joinServer() {
        if (loading) return;

        const regex = /^(https?:\/\/)?(spark.mart1d4.dev\/)?[a-zA-Z0-9\-]{7,32}$/;

        if (!invite.match(regex)) {
            setError("Please enter a valid invite link or code.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const { errors } = await sendRequest({
                query: "ACCEPT_INVITE",
                params: {
                    inviteId: invite.replace(/(https?:\/\/)?spark.mart1d4.dev\//, ""),
                },
                body: {
                    isGuild: true,
                },
            });

            if (!errors) {
                setOpen(false);
            } else if (errors) {
                console.error(errors);
                setError("The invite is invalid or has expired.");
            }
        } catch (e) {
            console.error(e);
        }

        setLoading(false);
    }

    return (
        <>
            {error && (
                <Alert
                    type="danger"
                    message={error}
                />
            )}

            <div
                ref={sliderRef}
                style={{ width: 440 }}
                className={`keen-slider ${styles.container}`}
            >
                {slides.slice(0, 3).map((s, i) => {
                    if (i === 1 && type === "invite") {
                        s = slides[3];
                        i = 3;
                    }

                    return (
                        <div
                            role="button"
                            key={i === 3 ? 1 : i}
                            // @ts-ignore - inert is not a valid attribute
                            inert={current !== (i === 3 ? 1 : i) ? "true" : undefined}
                            className={`keen-slider__slide number-slide${i === 3 ? 2 : i + 1}`}
                        >
                            <header className={styles.header}>
                                <h1>{s[1]}</h1>
                                <p style={{ userSelect: "none" }}>{s[0]}</p>

                                <button
                                    type="button"
                                    className={styles.close}
                                    onClick={() => setOpen(false)}
                                >
                                    <Icon name="close" />
                                </button>
                            </header>

                            <section
                                tabIndex={-1}
                                className="scrollbar"
                            >
                                {i === 0 ? (
                                    types.map((obj, j) => {
                                        const item = (
                                            <button
                                                type="button"
                                                key={obj.value}
                                                className={styles.type}
                                                onClick={() => {
                                                    setType(obj.value);
                                                    setCurrent((p) => p + 1);
                                                }}
                                            >
                                                <img
                                                    src={`/assets/system/${obj.value}.svg`}
                                                    alt={obj.name}
                                                />

                                                <p>{obj.name}</p>

                                                <Icon
                                                    size={20}
                                                    name="caret"
                                                />
                                            </button>
                                        );

                                        if (j === 1) {
                                            return (
                                                <Fragment key={obj.value}>
                                                    <p>Start from a template</p>
                                                    {item}
                                                </Fragment>
                                            );
                                        }

                                        return item;
                                    })
                                ) : i === 3 ? (
                                    <div className={styles.invite}>
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                joinServer();
                                            }}
                                        >
                                            <Input
                                                required
                                                error={error}
                                                value={invite}
                                                label="Invite Link"
                                                placeholder={linkTypes[1]}
                                                onChange={(v) => setInvite(v as string)}
                                            />
                                        </form>

                                        <h2>Invites should look like</h2>

                                        <ul>
                                            {linkTypes.map((link) => (
                                                <li key={link}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setInvite(link)}
                                                    >
                                                        {link}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className={`${styles.type} ${styles.discover}`}>
                                            <img
                                                src="/assets/system/discover.svg"
                                                alt="Discover Servers"
                                            />

                                            <div>
                                                <h2>Don't have an invite?</h2>
                                                <p>
                                                    Check out Discoverable communities in Server
                                                    Discovery.
                                                </p>
                                            </div>

                                            <Icon
                                                size={20}
                                                name="caret"
                                            />
                                        </div>
                                    </div>
                                ) : i === 1 ? (
                                    <div>
                                        {whoForTypes.map((obj) => (
                                            <button
                                                type="button"
                                                key={obj.value}
                                                className={styles.type}
                                                onClick={() => {
                                                    setWhoFor(obj.value);
                                                    setCurrent((p) => p + 1);
                                                }}
                                            >
                                                <img
                                                    alt={obj.name}
                                                    src={`/assets/system/${obj.value}.svg`}
                                                />

                                                <p>{obj.name}</p>

                                                <Icon
                                                    size={20}
                                                    name="caret"
                                                />
                                            </button>
                                        ))}

                                        <span style={{ userSelect: "none" }}>
                                            Not sure? You can{" "}
                                            <a
                                                tabIndex={0}
                                                role="button"
                                                aria-label="skip this question"
                                                onClick={() => {
                                                    setWhoFor("skip");
                                                    setCurrent((p) => p + 1);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        setWhoFor("skip");
                                                        setCurrent((p) => p + 1);
                                                    }
                                                }}
                                            >
                                                skip this question
                                            </a>{" "}
                                            for now.
                                        </span>
                                    </div>
                                ) : (
                                    <div className={styles.customize}>
                                        <div className={styles.icon}>
                                            <div>
                                                {icon ? (
                                                    <img
                                                        alt="Server Icon"
                                                        src={URL.createObjectURL(icon)}
                                                    />
                                                ) : (
                                                    <svg
                                                        viewBox="0 0 80 80"
                                                        fill="none"
                                                        height="80"
                                                        width="80"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            clipRule="evenodd"
                                                            d="M54.8694 2.85498C53.8065 2.4291 52.721 2.04752 51.6153 1.71253L51.3254 2.66957L51.0354 3.62661C51.9783 3.91227 52.9057 4.23362 53.8161 4.58911C54.1311 3.98753 54.4832 3.40847 54.8694 2.85498ZM75.4109 26.1839C76.0125 25.8689 76.5915 25.5168 77.145 25.1306C77.5709 26.1935 77.9525 27.279 78.2875 28.3847L77.3304 28.6746L76.3734 28.9646C76.0877 28.0217 75.7664 27.0943 75.4109 26.1839ZM78.8148 43.8253L79.8102 43.9222C79.9357 42.6318 80 41.3234 80 40C80 38.6766 79.9357 37.3682 79.8102 36.0778L78.8148 36.1747L77.8195 36.2715C77.9389 37.4977 78 38.7414 78 40C78 41.2586 77.9389 42.5023 77.8195 43.7285L78.8148 43.8253ZM43.8253 1.18515L43.9222 0.189853C42.6318 0.0642679 41.3234 0 40 0C38.6766 0 37.3682 0.064268 36.0778 0.189853L36.1747 1.18515L36.2715 2.18045C37.4977 2.06112 38.7414 2 40 2C41.2586 2 42.5023 2.06112 43.7285 2.18045L43.8253 1.18515ZM28.6746 2.66957L28.3847 1.71253C25.8549 2.47897 23.4312 3.48925 21.1408 4.71604L21.6129 5.59756L22.0851 6.47907C24.2606 5.3138 26.5624 4.35439 28.9646 3.62661L28.6746 2.66957ZM15.2587 9.85105L14.6239 9.0784C12.5996 10.7416 10.7416 12.5996 9.0784 14.6239L9.85105 15.2587L10.6237 15.8935C12.2042 13.9699 13.9699 12.2042 15.8935 10.6237L15.2587 9.85105ZM5.59756 21.6129L4.71604 21.1408C3.48925 23.4312 2.47897 25.8549 1.71253 28.3847L2.66957 28.6746L3.62661 28.9646C4.35439 26.5624 5.3138 24.2607 6.47907 22.0851L5.59756 21.6129ZM0 40C0 38.6766 0.0642679 37.3682 0.189853 36.0778L1.18515 36.1747L2.18045 36.2715C2.06112 37.4977 2 38.7414 2 40C2 41.2586 2.06112 42.5023 2.18045 43.7285L1.18515 43.8253L0.189853 43.9222C0.064268 42.6318 0 41.3234 0 40ZM2.66957 51.3254L1.71253 51.6153C2.47897 54.1451 3.48926 56.5688 4.71604 58.8592L5.59756 58.3871L6.47907 57.9149C5.3138 55.7394 4.35439 53.4376 3.62661 51.0354L2.66957 51.3254ZM9.85105 64.7413L9.0784 65.3761C10.7416 67.4004 12.5996 69.2584 14.6239 70.9216L15.2587 70.1489L15.8935 69.3763C13.9699 67.7958 12.2042 66.0301 10.6237 64.1065L9.85105 64.7413ZM21.6129 74.4024L21.1408 75.284C23.4312 76.5107 25.8549 77.521 28.3847 78.2875L28.6746 77.3304L28.9646 76.3734C26.5624 75.6456 24.2607 74.6862 22.0851 73.5209L21.6129 74.4024ZM36.1747 78.8148L36.0778 79.8102C37.3682 79.9357 38.6766 80 40 80C41.3234 80 42.6318 79.9357 43.9222 79.8102L43.8253 78.8148L43.7285 77.8195C42.5023 77.9389 41.2586 78 40 78C38.7414 78 37.4977 77.9389 36.2715 77.8195L36.1747 78.8148ZM51.3254 77.3304L51.6153 78.2875C54.1451 77.521 56.5688 76.5107 58.8592 75.284L58.3871 74.4024L57.9149 73.5209C55.7394 74.6862 53.4376 75.6456 51.0354 76.3734L51.3254 77.3304ZM64.7413 70.1489L65.3761 70.9216C67.4004 69.2584 69.2584 67.4004 70.9216 65.3761L70.1489 64.7413L69.3763 64.1065C67.7958 66.0301 66.0301 67.7958 64.1065 69.3763L64.7413 70.1489ZM74.4024 58.3871L75.284 58.8592C76.5107 56.5688 77.521 54.1451 78.2875 51.6153L77.3304 51.3254L76.3734 51.0354C75.6456 53.4375 74.6862 55.7393 73.5209 57.9149L74.4024 58.3871Z"
                                                            fill="currentColor"
                                                        />
                                                        <circle
                                                            cx="68"
                                                            cy="12"
                                                            r="12"
                                                            fill="#5865f2"
                                                        />
                                                        <path
                                                            d="M73.3332 11.4075H68.5924V6.66675H67.4072V11.4075H62.6665V12.5927H67.4072V17.3334H68.5924V12.5927H73.3332V11.4075Z"
                                                            fill="white"
                                                        />
                                                        <path
                                                            d="M40 29C37.794 29 36 30.794 36 33C36 35.207 37.794 37 40 37C42.206 37 44 35.207 44 33C44 30.795 42.206 29 40 29Z"
                                                            fill="currentColor"
                                                        />
                                                        <path
                                                            d="M48 26.001H46.07C45.402 26.001 44.777 25.667 44.406 25.111L43.594 23.891C43.223 23.335 42.598 23 41.93 23H38.07C37.402 23 36.777 23.335 36.406 23.89L35.594 25.11C35.223 25.667 34.598 26 33.93 26H32C30.895 26 30 26.896 30 28V39C30 40.104 30.895 41 32 41H48C49.104 41 50 40.104 50 39V28C50 26.897 49.104 26.001 48 26.001ZM40 39C36.691 39 34 36.309 34 33C34 29.692 36.691 27 40 27C43.309 27 46 29.692 46 33C46 36.31 43.309 39 40 39Z"
                                                            fill="currentColor"
                                                        />
                                                        <path
                                                            d="M24.6097 52.712V47.72H22.5457V52.736C22.5457 53.792 22.0777 54.404 21.1417 54.404C20.2177 54.404 19.7377 53.78 19.7377 52.712V47.72H17.6737V52.724C17.6737 55.04 19.0897 56.132 21.1177 56.132C23.1217 56.132 24.6097 55.016 24.6097 52.712ZM26.0314 56H28.0834V53.252H28.6114C30.6154 53.252 31.9474 52.292 31.9474 50.42C31.9474 48.62 30.7114 47.72 28.6954 47.72H26.0314V56ZM29.9554 50.456C29.9554 51.308 29.4514 51.704 28.5394 51.704H28.0594V49.268H28.5754C29.4874 49.268 29.9554 49.664 29.9554 50.456ZM37.8292 56L37.5532 54.224H35.0092V47.72H32.9572V56H37.8292ZM45.9558 51.848C45.9558 49.292 44.4078 47.564 42.0078 47.564C39.6078 47.564 38.0478 49.304 38.0478 51.872C38.0478 54.428 39.6078 56.156 41.9838 56.156C44.3958 56.156 45.9558 54.404 45.9558 51.848ZM43.8918 51.86C43.8918 53.504 43.1958 54.548 41.9958 54.548C40.8078 54.548 40.0998 53.504 40.0998 51.86C40.0998 50.216 40.8078 49.172 41.9958 49.172C43.1958 49.172 43.8918 50.216 43.8918 51.86ZM52.2916 56.084L54.3676 55.748L51.4876 47.684H49.2316L46.2556 56H48.2716L48.8236 54.284H51.6916L52.2916 56.084ZM50.2516 49.796L51.1756 52.676H49.3156L50.2516 49.796ZM62.5174 51.848C62.5174 49.388 61.0174 47.72 58.1374 47.72H55.2814V56H58.1854C60.9814 56 62.5174 54.308 62.5174 51.848ZM60.4534 51.86C60.4534 53.636 59.5414 54.404 58.0774 54.404H57.3334V49.316H58.0774C59.4814 49.316 60.4534 50.12 60.4534 51.86Z"
                                                            fill="currentColor"
                                                        />
                                                    </svg>
                                                )}

                                                <input
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                                                    className={styles.iconInput}
                                                    onChange={(e) => {
                                                        if (e.target.files) {
                                                            if (
                                                                e.target.files[0].size >
                                                                4 * 1024 * 1024
                                                            ) {
                                                                setError(
                                                                    "File size should be less than 4MB"
                                                                );
                                                                setTimeout(
                                                                    () => setError(""),
                                                                    5000
                                                                );
                                                                return;
                                                            }

                                                            setIcon(e.target.files[0]);
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                createServer();
                                            }}
                                        >
                                            <Input
                                                value={name}
                                                error={error}
                                                label="Server Name"
                                                onChange={(v) => setName(v as string)}
                                            />

                                            <p style={{ userSelect: "none" }}>
                                                By creating a server, you agree to Spark's{" "}
                                                <a href="/">Community Guidelines</a>.
                                            </p>
                                        </form>
                                    </div>
                                )}
                            </section>

                            {i === 0 ? (
                                <footer className={`${styles.footer} ${styles.centered}`}>
                                    <h2>Have an invite already?</h2>
                                    <button
                                        type="button"
                                        className="button grey"
                                        onClick={() => {
                                            setType("invite");
                                            setCurrent(1);
                                        }}
                                    >
                                        Join a Server
                                    </button>
                                </footer>
                            ) : (
                                <footer className={styles.footer}>
                                    <button
                                        type="button"
                                        className="button"
                                        onClick={() => {
                                            if (whoFor) {
                                                setWhoFor(null);
                                            }

                                            setError("");
                                            setCurrent((p) => (i === 3 ? 0 : p - 1));
                                        }}
                                    >
                                        Back
                                    </button>

                                    {(i === 2 || i === 3) && (
                                        <button
                                            type="submit"
                                            tabIndex={i === 2 && !name ? -1 : 0}
                                            className={`button submit blue ${
                                                i === 2 && !name ? "disabled" : ""
                                            }`}
                                            onClick={() => {
                                                if (i === 2) createServer();
                                                else joinServer();
                                            }}
                                        >
                                            {loading ? (
                                                <LoadingDots />
                                            ) : i === 2 ? (
                                                "Create"
                                            ) : (
                                                "Join Server"
                                            )}
                                        </button>
                                    )}
                                </footer>
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
