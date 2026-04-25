export type DeadlineTone = 'upcoming' | 'today' | 'overdue';

export const getLocalDateKey = (value = new Date()) => {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDeadlineTone = (dueDate: string, todayKey = getLocalDateKey()): DeadlineTone => {
  if (dueDate === todayKey) {
    return 'today';
  }

  return dueDate < todayKey ? 'overdue' : 'upcoming';
};

export const formatDeadlineDate = (dueDate: string) => {
  const parsed = new Date(`${dueDate}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return dueDate;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
};

export const getDaysUntilDeadline = (dueDate: string, todayKey = getLocalDateKey()) => {
  const due = new Date(`${dueDate}T00:00:00`);
  const today = new Date(`${todayKey}T00:00:00`);

  if (Number.isNaN(due.getTime()) || Number.isNaN(today.getTime())) {
    return 0;
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((due.getTime() - today.getTime()) / msPerDay);
};

export const sortByDueDate = <T extends { dueDate: string }>(items: T[]) =>
  [...items].sort((left, right) => {
    if (left.dueDate === right.dueDate) {
      return 0;
    }

    return left.dueDate < right.dueDate ? -1 : 1;
  });
