import styles from "./MessageSk.module.css";
import React, { memo } from "react";
import { nanoid } from "nanoid";

export const MessageSk = memo(() => {
    const mainBlob = (width: number) => (
        <div
            key={nanoid()}
            className={styles.blob}
            style={{ width: `${width}rem` }}
        />
    );

    return (
        <>
            {[...Array(26)].map(() => {
                const blobNumber = Math.floor(Math.random() * (3 - 0 + 1) + 0);

                return (
                    <React.Fragment key={nanoid()}>
                        <div
                            aria-hidden="true"
                            className={styles.wrapper}
                            style={{ marginTop: "1rem" }}
                        >
                            <div>
                                <div className={styles.avatar} />

                                <h3 className={styles.username}>
                                    {mainBlob(Math.random() * (7.375 - 5 + 1) + 5)}
                                </h3>

                                <div className={styles.blobContainer}>
                                    {[...Array(Math.floor(Math.random() * (8 - 3 + 1) + 3))].map(
                                        () => mainBlob(Math.random() * (4.825 - 1.875 + 1) + 1.875)
                                    )}
                                </div>
                            </div>
                        </div>

                        {[...Array(blobNumber)].map(() => {
                            const randomNum = Math.floor(Math.random() * (7 - 1 + 1) + 1);

                            if (randomNum === 1) {
                                return (
                                    <div
                                        key={nanoid()}
                                        aria-hidden="true"
                                        className={styles.wrapper}
                                    >
                                        <div className={styles.attachement}>
                                            <div
                                                style={{
                                                    width: `${Math.floor(
                                                        Math.random() * (400 - 150 + 1) + 150
                                                    )}px`,
                                                    height: `${Math.floor(
                                                        Math.random() * (400 - 150 + 1) + 150
                                                    )}px`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            } else {
                                return (
                                    <div
                                        key={nanoid()}
                                        aria-hidden="true"
                                        className={styles.wrapper}
                                    >
                                        <div>
                                            <div className={styles.blobContainer}>
                                                {[
                                                    ...Array(
                                                        Math.floor(Math.random() * (8 - 3 + 1) + 3)
                                                    ),
                                                ].map(() =>
                                                    mainBlob(
                                                        Math.random() * (4.825 - 1.875 + 1) + 1.875
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </React.Fragment>
                );
            })}
        </>
    );
});
