// @ts-nocheck


export function randomStr(loop: number) {
  let str = ''
  for (let i = 0; i < loop; i++) {
    str += Math.random().toString(36).slice(-8)
  }
  return str
}



export function toFriendlyTimeEn(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const secondsAgo = Math.floor((now - date) / 1000);

  // 判断是否在今天
  if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
    // 小于1分钟，显示刚刚
    if (secondsAgo < 60) {
      return 'Just now';
    }

    // 大于1分钟小于60分钟，显示具体几分钟前
    if (secondsAgo < 60 * 60) {
      const minutes = Math.floor(secondsAgo / 60);
      return `${minutes} Minutes ago`;
    }

    // 大于60分钟小于2小时，显示具体几小时+分钟前
    if (secondsAgo < 60 * 60 * 2) {
      const hours = Math.floor(secondsAgo / (60 * 60));
      const minutes = Math.floor((secondsAgo - hours * 60 * 60) / 60);
      return `${hours} Hour ${minutes} Minutes ago`;
    }

    // 超过2小时，显示具体的几点几分
    const ampm = date.getHours() >= 12 ? 'Afternoon' : 'Morning';
    const hour = date.getHours() % 12 || 12;
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${ampm} ${hour}:${minute}`;
  }

  // 不在今天，判断是否在两天内
  const oneDayMs = 24 * 60 * 60 * 1000;
  if (now - date < oneDayMs * 2) {
    if (date.getDate() === now.getDate() - 1 && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
      // 昨天
      const ampm = date.getHours() >= 12 ? 'Afternoon' : 'Morning';
      const hour = date.getHours() % 12 || 12;
      const minute = date.getMinutes().toString().padStart(2, '0');
      return `Yesterday ${ampm} ${hour}:${minute}`;
    } else {
      // 前天
      const ampm = date.getHours() >= 12 ? 'Afternoon' : 'Morning';
      const hour = date.getHours() % 12 || 12;
      const minute = date.getMinutes().toString().padStart(2, '0');
      return `The day before yesterday ${ampm} ${hour}:${minute}`;
    }
  }

  // 不在两天内，判断是否在同一周
  const oneWeekMs = oneDayMs * 7;
  const diffMs = now - date;
  if (diffMs < oneWeekMs) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const ampm = date.getHours() >= 12 ? 'Afternoon' : 'Morning';
    const hour = date.getHours() % 12 || 12;
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${days[date.getDay()]} ${ampm} ${hour}:${minute}`;
  }

  // 不在同一周，显示具体年月日+时间
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const ampm = date.getHours() >= 12 ? 'Afternoon' : 'Morning';
  const hour = date.getHours() % 12 || 12;
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${ampm} ${hour}:${minute}`;
}

