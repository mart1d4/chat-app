import { useEffect, useState } from "react";

export const useIntersection = (element, rootMargin: number) => {
    const [isVisible, setState] = useState(false);

    useEffect(() => {
        const current = element?.current;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setState(entry.isIntersecting);
            },
            { rootMargin: `${rootMargin}px` }
        );

        current && observer.observe(current);
        return () => current && observer.unobserve(current);
    }, []);

    return isVisible;
};
