import { useEffect, useState } from 'react';

const AnimatedCounter = ({ value, duration = 1000, decimals = 2 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(value) || 0;
    const increment = end / (duration / 16);
    let current = start;

    const interval = setInterval(() => {
      current += increment;
      if (current >= end) {
        setDisplayValue(end);
        clearInterval(interval);
      } else {
        setDisplayValue(current);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [value, duration]);

  const formatNumber = (num) => {
    if (num > 1000000) {
      return (num / 1000000).toFixed(decimals) + 'M';
    }
    if (num > 1000) {
      return (num / 1000).toFixed(decimals) + 'K';
    }
    return num.toFixed(decimals);
  };

  return <>{formatNumber(displayValue)}</>;
};

export default AnimatedCounter;
