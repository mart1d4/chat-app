import Header from "./web-components/Header/Header";
import Footer from "./web-components/Footer/Footer";
import styles from "./Home.module.css";
import type { Metadata } from "next";
import { Icon } from "@components";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Chat App | Your Inviting Place to Connect and Chat.",
    description:
        "Chat App makes communication a breeze, offering seamless voice, video, and text interactions. Stay connected, socialize, and nurture bonds with friends and communities effortlessly.",
    keywords:
        "chat-app, chat, voice, video, text, gaming, friends, communities, free, open source, open source software, open source project",
    openGraph: {
        title: "Chat App | Your Inviting Place to Connect and Chat.",
        description:
            "Chat App makes communication a breeze, offering seamless voice, video, and text interactions. Stay connected, socialize, and nurture bonds with friends and communities effortlessly.",
        url: "https://chat-app.mart1d4.dev",
        type: "website",
        siteName: "Chat App",
        locale: "en_US",
        images: [
            {
                url: "https://ucarecdn.com/7ba4e655-043d-4bf9-8c1f-7cbff20b6157/",
                width: 128,
                height: 128,
                alt: "Chat App Logo",
            },
        ],
    },
};

const HomePage = () => {
    return (
        <div className={styles.mainContainer}>
            <div className={styles.heading}>
                <Header />

                <div className={styles.hero}>
                    <div>
                        <div className={styles.heroText}>
                            <h1>Discover a future</h1>
                            <div>
                                A future of communication with our web app. Our platform offers advanced features and
                                tools that allow you to communicate in new and exciting ways. From video calls to voice
                                messages and more, you'll be able to express yourself like never before.
                            </div>
                        </div>

                        <div className={styles.heroButtons}>
                            <Link href="/download">
                                <Icon name="download" />
                                Download for Windows
                            </Link>

                            <Link href="/login">Open Chat App in your browser</Link>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div className={styles.contentGrid}>
                    <div>
                        <img
                            src="https://ucarecdn.com/fbb73e90-e5a5-4ec6-b2d4-4a7a17657fbd/"
                            alt="Stylized image of friends talking and communicating with each other."
                        />

                        <div>
                            <h2>Connect with Friends and Communities</h2>

                            <div>
                                Get in touch and communicate with your friends and communities. With features such as
                                voice and video calls, messaging, and channels, you can easily stay connected and engage
                                with others who share your interests.
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.contentGrid}>
                    <div>
                        <img
                            src="https://ucarecdn.com/6017a425-258a-4665-944c-14f4a09f45d5/"
                            alt="Stylized image showing the world connected through Chat App."
                        />

                        <div>
                            <h2>Stay On Anytime, Anywhere</h2>

                            <div>
                                Stay connected with your friends and communities anytime, anywhere. With our responsive
                                design and mobile app support, access your conversations on any device. Never miss out
                                on a conversation or update again.
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.contentGrid}>
                    <div>
                        <img
                            src="https://ucarecdn.com/bd719cc4-d77a-4c75-8fe7-80bf86ad33bc/"
                            alt="Stylized image showing friends displaying their interests and hobbies."
                        />

                        <div>
                            <h2>Your Personal Communication Hub</h2>

                            <div>
                                Connect with your friends, collaborate with your team, and build your community all in
                                one place. With features such as server customization and mobile support, you'll be able
                                to communicate on your terms.
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.contentGrid}>
                    <div>
                        <div>
                            <h2>Unleash Your Potential</h2>

                            <div>
                                Connect with people in ways you never thought possible. From voice and video calls to
                                messaging and channels, our platform provides a seamless experience that allows you to
                                communicate with friends, teams, and communities.
                            </div>
                        </div>

                        <img
                            src="https://ucarecdn.com/87faf419-4c2b-4434-843c-6d2ec2cfe338/"
                            alt="Stylized image showing friends video talking with each other on desktop."
                        />
                    </div>
                </div>

                <div className={styles.contentGrid}>
                    <div>
                        <h4>Ready to begin on your journey?</h4>

                        <Link href="/download">
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
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default HomePage;
