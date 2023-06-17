import { useEffect, useMemo, useState, RefObject } from 'react';

const useOnScreen = (ref: RefObject<HTMLElement>) => {
    const [isIntersecting, setIntersecting] = useState(false);

    const observer = useMemo(
        () => new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting)),
        [ref]
    );

    useEffect(() => {
        if (!ref.current) return;
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref, observer]);

    return isIntersecting;
};

export default useOnScreen;
