export const formatTimestamp = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} năm`;
  if (months > 0) return `${months} tháng`;
  if (weeks > 0) return `${weeks} tuần`;
  if (days > 0) return `${days} ngày`;
  if (hours > 0) return `${hours} giờ`;
  if (minutes > 0) return `${minutes} phút`;
  if (seconds > 30) return `${seconds} giây`;
  
  return 'Vừa xong';
};

export const formatChatTimestamp = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if it's today
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
  
  // Check if it's yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Hôm qua';
  }
  
  // Check if it's within the last 7 days
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[date.getDay()];
  }
  
  // Otherwise show the date
  return date.toLocaleDateString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit' 
  });
};

export const isToday = (timestamp: number): boolean => {
  const today = new Date();
  const date = new Date(timestamp);
  return date.toDateString() === today.toDateString();
};

export const isYesterday = (timestamp: number): boolean => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const date = new Date(timestamp);
  return date.toDateString() === yesterday.toDateString();
};
