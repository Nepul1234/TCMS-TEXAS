import { useEffect, useState } from "react";

const Counter = ({ targetNumber = 100, duration = 2000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start;
        
        const animateCount = (timestamp) => {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            const progress = Math.min(elapsed / duration, 1);
            
            setCount(Math.floor(progress * targetNumber));
            
            if (progress < 1) {
                requestAnimationFrame(animateCount);
            } else {
                setCount(targetNumber);
            }
        };

        requestAnimationFrame(animateCount);
    }, [targetNumber, duration]);

    return <span>{count}</span>;
};

export default Counter;
