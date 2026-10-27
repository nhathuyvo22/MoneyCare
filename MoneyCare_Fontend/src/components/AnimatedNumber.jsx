import React from 'react';
import { useCountUp } from '../hooks/useCountUp';

/**
 * Component hiển thị số có hiệu ứng Count-Up chuyển động mượt mà
 * Hỗ trợ chế độ ẩn số dư (•••••• đ)
 */
export default function AnimatedNumber({
  value,
  duration = 900,
  hideBalance = false,
  mask = '•••••••• đ',
  suffix = ' đ',
  prefix = '',
  className = '',
  style = {},
  decimals = 0,
}) {
  const animatedVal = useCountUp(value, { duration, decimals });

  if (hideBalance) {
    return <span className={className} style={style}>{mask}</span>;
  }

  const rounded = Math.round(animatedVal);
  const formatted = rounded.toLocaleString('vi-VN');

  return (
    <span className={className} style={style}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
