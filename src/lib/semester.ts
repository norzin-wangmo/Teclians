/** Current academic semester window (Jan–Jun or Jul–Dec). */
export function currentSemesterRange(): { start: Date; end: Date } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (month < 6) {
    return {
      start: new Date(year, 0, 1),
      end: new Date(year, 5, 30, 23, 59, 59, 999),
    };
  }

  return {
    start: new Date(year, 6, 1),
    end: new Date(year, 11, 31, 23, 59, 59, 999),
  };
}
