const pad = (n) => String(n).padStart(2, '0');

// SQL Server DATETIME has no zone; the real API serialises it as if it were UTC,
// so pages print these digits as-is. Mirror that with local date parts.
export const toWallClock = (date) =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    + `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.000Z`;

export const daysAgo = (today, days, hours, minutes = 0) =>
    toWallClock(new Date(today.getFullYear(), today.getMonth(), today.getDate() - days, hours, minutes));
