import PopoverButton from "../web-components/PopoverButton/Popover";
import Header from "../web-components/Header/Header";
import Footer from "../web-components/Footer/Footer";
import styles from "./Download.module.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Download Spark to Talk, Chat and Hang Out",
};

const cardItems: {
    name: string;
    image: string;
    urls: string[][] | string;
}[] = [
    {
        name: "iOS",
        image: "/assets/system/ios.svg",
        urls: "",
    },
    {
        name: "Android",
        image: "/assets/system/android.svg",
        urls: "",
    },
    {
        name: "Linux",
        image: "/assets/system/linux.svg",
        urls: [
            ["deb", ""],
            ["tar.gz", ""],
        ],
    },
    {
        name: "Mac",
        image: "/assets/system/mac.svg",
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
                            <h1>Get Spark for any device</h1>

                            <div>
                                Embark on an exciting journey with Spark. Share thrilling moments
                                with friends on our desktop app and continue the excitement on the
                                go with seamless mobile conversations.
                            </div>
                        </div>

                        <div>
                            <a
                                download="Spark-Setup.exe"
                                href="/app/download/latest/Spark-Setup.exe"
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
                            src="/assets/system/laptop_call.svg"
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
                                            Discover new features before they launch with Spark's
                                            Public Test Build.
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
                                                src={item.image}
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
