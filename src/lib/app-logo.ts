export const DEFAULT_APP_LOGO = "https://k.top4top.io/p_36885vv362.png";
export const HALLOWEEN_APP_LOGO = "https://d.top4top.io/p_39540emg41.png";

/**
 * Returns the active app logo based on promotional, seasonal, and holiday schedules.
 * - Promo period: 30 June 2026 - 16 July 2026
 * - Anniversary: 23 July 2026 - 24 July 2026 5:00 AM
 * - Mourning Day: 22 September 2026 - 23 September 2026 6:30 AM
 * - Iraqi Independence Day: 3 October 2026 - 4 October 2026 2:30 AM
 * - Halloween Day: 29 October 2026 00:00 - 1 November 2026 5:00 AM
 */
export function getAppLogo(date: Date = new Date()): string {
  const startDate1 = new Date('2026-06-30T00:00:00');
  const endDate1 = new Date('2026-07-16T00:00:00');

  const startDate2 = new Date('2026-07-23T00:00:00');
  const endDate2 = new Date('2026-07-24T05:00:00');

  const startDate3 = new Date('2026-09-22T00:00:00');
  const endDate3 = new Date('2026-09-23T06:30:00');

  const startDate4 = new Date('2026-10-03T00:00:00');
  const endDate4 = new Date('2026-10-04T02:30:00');

  // Halloween Day: from 29 October 2026 until 1 November 2026 at 5:00AM
  const startDate5 = new Date('2026-10-29T00:00:00');
  const endDate5 = new Date('2026-11-01T05:00:00');

  if (date >= startDate1 && date < endDate1) {
    return "https://g.top4top.io/p_38330txup1.png";
  } else if (date >= startDate2 && date < endDate2) {
    return "https://a.top4top.io/p_3856ltiqu1.png";
  } else if (date >= startDate3 && date < endDate3) {
    return "https://c.top4top.io/p_3917mkdmh1.png";
  } else if (date >= startDate4 && date < endDate4) {
    return "https://d.top4top.io/p_3928xkymg1.png";
  } else if (date >= startDate5 && date < endDate5) {
    return HALLOWEEN_APP_LOGO;
  } else {
    return DEFAULT_APP_LOGO;
  }
}
