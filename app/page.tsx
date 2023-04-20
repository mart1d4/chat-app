import Header from './web-components/Header/Header';
import Footer from './web-components/Footer/Footer';
import styles from './HomePage.module.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Chat App | Your Place to Talk and to Hang Out',
    description:
        'Chat App is the easiest way to talk over voice, video, and text. Chat, hang out, and stay close with your friends and communities.',
    keywords:
        'chat-app, chat, voice, video, text, gaming, friends, communities, free, open source, open source software, open source project',
};

const HomePage = () => {
    return (
        <div className={styles.mainContainer}>
            <div className={styles.heading}>
                <Header />

                <div className={styles.hero}>
                    <div>
                        <div className={styles.heroText}>
                            <h1>IMAGINE A PLACE...</h1>
                            <div>
                                ...where you can belong to a school club, a
                                gaming group, or a worldwide art community.
                                Where just you and a handful of friends can
                                spend time together. A place that makes it easy
                                to talk every day and hang out more often.
                            </div>
                        </div>

                        <div className={styles.heroButtons}>
                            <Link href='/download'>
                                <svg
                                    width='24'
                                    height='24'
                                    viewBox='0 0 24 24'
                                >
                                    <g fill='currentColor'>
                                        <path d='M17.707 10.708L16.293 9.29398L13 12.587V2.00098H11V12.587L7.70697 9.29398L6.29297 10.708L12 16.415L17.707 10.708Z' />
                                        <path d='M18 18.001V20.001H6V18.001H4V20.001C4 21.103 4.897 22.001 6 22.001H18C19.104 22.001 20 21.103 20 20.001V18.001H18Z' />
                                    </g>
                                </svg>
                                Download for Windows
                            </Link>

                            <Link href='/login'>
                                Open Discord in your browser
                            </Link>
                        </div>
                    </div>
                </div>

                <div className={styles.imageBackground}>
                    <img
                        src='/assets/home-background1.svg'
                        draggable='false'
                    />
                    <img
                        src='/assets/home-background2.svg'
                        draggable='false'
                    />
                    <img
                        src='/assets/home-background3.svg'
                        draggable='false'
                    />
                </div>
            </div>

            <div>
                <div className={styles.contentGrid}>
                    <div>
                        <img
                            src='/assets/home-content1.svg'
                            alt='Stylized image of a Discord server with multiple channels for studying, games, cooking, and pet photos.'
                        />

                        <div>
                            <h2>
                                Create an invite-only place where you belong
                            </h2>

                            <div>
                                Discord servers are organized into topic-based
                                channels where you can collaborate, share, and
                                just talk about your day without clogging up a
                                group chat.
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.contentGrid}>
                    <div>
                        <img
                            src='/assets/home-content2.svg'
                            alt='Stylized image showing friends hanging out in multiple voice channels.'
                        />

                        <div>
                            <h2>Where hanging out is easy</h2>

                            <div>
                                Grab a seat in a voice channel when you’re free.
                                Friends in your server can see you’re around and
                                instantly pop in to talk without having to call.
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.contentGrid}>
                    <div>
                        <img
                            src='/assets/home-content3.svg'
                            alt='Stylized image showing friends in a server organized into roles for Coach, Student Lead, and Animal Crossing.'
                        />

                        <div>
                            <h2>From few to a fandom</h2>

                            <div>
                                Get any community running with moderation tools
                                and custom member access. Give members special
                                powers, set up private channels, and more.
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.contentGrid}>
                    <div>
                        <div>
                            <h2>Reliable tech for staying close</h2>

                            <div>
                                Low-latency voice and video feels like you’re in
                                the same room. Wave hello over video, watch
                                friends stream their games, or gather up and
                                have a drawing session with screen share.
                            </div>
                        </div>

                        <img
                            src='/assets/home-content4.svg'
                            alt='Stylized image showing friends video talking with each other on desktop and mobile.'
                        />
                    </div>
                </div>

                <div className={styles.contentGrid}>
                    <div>
                        <div>
                            <img
                                src='/assets/home-content5.svg'
                                draggable='false'
                            />
                        </div>

                        <h4>Ready to start your journey?</h4>

                        <a href=''>
                            <svg
                                width='24'
                                height='24'
                                viewBox='0 0 24 24'
                            >
                                <g fill='currentColor'>
                                    <path d='M17.707 10.708L16.293 9.29398L13 12.587V2.00098H11V12.587L7.70697 9.29398L6.29297 10.708L12 16.415L17.707 10.708Z' />
                                    <path d='M18 18.001V20.001H6V18.001H4V20.001C4 21.103 4.897 22.001 6 22.001H18C19.104 22.001 20 21.103 20 20.001V18.001H18Z' />
                                </g>
                            </svg>
                            Download for Windows
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default HomePage;
