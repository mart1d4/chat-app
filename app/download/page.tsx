import PopoverButton from '../web-components/PopoverButton/Popover';
import Header from '../web-components/Header/Header';
import Footer from '../web-components/Footer/Footer';
import styles from './Download.module.css';
import type { Metadata } from 'next';
import { ReactElement } from 'react';

export const metadata: Metadata = {
    title: 'Download Chat App to Talk, Chat and Hang Out',
};

const cardItems: string[] = ['iOS', 'Android', 'Linux', 'Mac', 'Feeling experimental?'];

const links: (
    | string
    | {
          [key: string]: string;
      }
)[] = [
    '',
    '',
    {
        deb: '',
        'tar.gz': '',
    },
    '',
    {
        Windows: '',
        'Linux deb': '',
        'Linux tar.gz': '',
        Mac: '',
    },
];

const DownloadPage = (): ReactElement => {
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

                            <div>Windows 7 or higher</div>
                        </div>
                    </div>

                    <div>
                        <img src='' />
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                <div>
                    <div>
                        {cardItems.map((item, index) => (
                            <div
                                className={styles.card}
                                key={index}
                            >
                                {index === 4 ? (
                                    <>
                                        <h3>Ready to experiment?</h3>

                                        <div>
                                            Discover new features before they launch with Chat App's Public Test Build.
                                        </div>

                                        <PopoverButton links={links[index]} />
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <h3>{item}</h3>
                                            {index === 2 ? (
                                                <PopoverButton links={links[index]} />
                                            ) : (
                                                <a href={links[index].toString()}>Download</a>
                                            )}
                                        </div>

                                        <img src={`/assets/homepages/${item}.svg`} />
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
};

export default DownloadPage;
