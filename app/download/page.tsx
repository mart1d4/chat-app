import PopoverButton from "../web-components/PopoverButton/Popover";
import Header from "../web-components/Header/Header";
import Footer from "../web-components/Footer/Footer";
import styles from "./Download.module.css";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Download Chat App to Talk, Chat and Hang Out",
};

const cardItems: {
    name: string;
    image: string;
    urls: string[][] | string;
}[] = [
    {
        name: "iOS",
        image: "19dadf2d-b78c-47e7-b3c5-aa19402832de",
        urls: "",
    },
    {
        name: "Android",
        image: "6d7ad58c-9235-4667-bc42-31ee3698bf22",
        urls: "",
    },
    {
        name: "Linux",
        image: "ec81e85f-b758-400f-bb7a-4e24924dcbd2",
        urls: [
            ["deb", ""],
            ["tar.gz", ""],
        ],
    },
    {
        name: "Mac",
        image: "d326513a-bcfc-4522-ae57-0fa44bb962ce",
        urls: "",
    },
    {
        name: "Feeling experimental?",
        image: "",
        urls: [
            ["Windows", ""],
            ["Linux deb", ""],
            ["Linux tar.gz", ""],
            ["Mac", ""],
        ],
    },
];

export default function DownloadPage() {
    return (
        <div className={styles.mainContainer}>
            <div className={styles.heading}>
                <Header />

                <div className={styles.hero}>
                    <div>
                        <div>
                            <h1>Get Chat App for any device</h1>

                            <div>
                                Embark on an exciting journey with Chat App. Share thrilling moments with friends on our
                                desktop app and continue the excitement on the go with seamless mobile conversations.
                            </div>
                        </div>

                        <div>
                            <a
                                href="/app/download/latest/ChatApp-Setup.exe"
                                download="ChatApp-Setup.exe"
                            >
                                <svg
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                >
                                    <g fill="currentColor">
                                        <path d="M17.707 10.708L16.293 9.29398L13 12.587V2.00098H11V12.587L7.70697 9.29398L6.29297 10.708L12 16.415L17.707 10.708Z" />
                                        <path d="M18 18.001V20.001H6V18.001H4V20.001C4 21.103 4.897 22.001 6 22.001H18C19.104 22.001 20 21.103 20 20.001V18.001H18Z" />
                                    </g>
                                </svg>
                                Download for Windows
                            </a>

                            <div>Windows 7 or higher</div>
                        </div>
                    </div>

                    <div>
                        <img
                            src="https://ucarecdn.com/f326c4c9-e67f-4971-9461-9b76dce08c3b/"
                            alt="People hanging out in voice chat."
                        />
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                <div>
                    <div>
                        {cardItems.map((item, index) => (
                            <div
                                key={item.name}
                                className={styles.card}
                            >
                                {index === 4 && typeof item.urls === "object" ? (
                                    <>
                                        <h3>Ready to experiment?</h3>

                                        <div>
                                            Discover new features before they launch with Chat App's Public Test Build.
                                        </div>

                                        <PopoverButton links={item.urls} />
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <h3>{item.name}</h3>
                                            {typeof item.urls === "object" ? (
                                                <PopoverButton links={item.urls} />
                                            ) : (
                                                <Link href={item.urls}>Download</Link>
                                            )}
                                        </div>

                                        {item.image !== "" && (
                                            <img
                                                src={`https://ucarecdn.com/${item.image}/`}
                                                alt={item.name}
                                                loading="lazy"
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
