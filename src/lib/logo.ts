/**
 * Application logo resolution utility.
 * Supports temporary seasonal logos based on date periods.
 */

export const DEFAULT_APP_LOGO = "https://k.top4top.io/p_36885vv362.png";
export const HALLOWEEN_APP_LOGO = "/assets/aistudio/Buhooth_Streaming_Halloween_2026_Logo_5a75f10f.png";

/**
 * Returns the active app logo URL based on the current date/time.
 * - Promo period: 2026-06-30T00:00:00 to 2026-07-16T00:00:00
 * - Anniversary period: 2026-07-23T00:00:00 to 2026-07-24T05:00:00
 * - Mourning Day: 2026-09-22T00:00:00 to 2026-09-23T06:30:00
 * - Iraqi Independence Day: 2026-10-03T00:00:00 to 2026-10-04T02:30:00
 * - Halloween Day 2026: 2026-10-29T00:00:00 to 2026-11-01T05:00:00
 */
export function getAppLogo(date?: Date): string {
  const now = date || new Date();

  // Halloween Day 2026 (From 29 October 2026 until 1 November 2026 at 5:00 AM)
  const startHalloween = new Date('2026-10-29T00:00:00');
  const endHalloween = new Date('2026-11-01T05:00:00');

  // Iraqi Independence Day 2026
  const startDate4 = new Date('2026-10-03T00:00:00');
  const endDate4 = new Date('2026-10-04T02:30:00');

  // Mourning Day
  const startDate3 = new Date('2026-09-22T00:00:00');
  const endDate3 = new Date('2026-09-23T06:30:00');

  // Anniversary period
  const startDate2 = new Date('2026-07-23T00:00:00');
  const endDate2 = new Date('2026-07-24T05:00:00');

  // Original promo period
  const startDate1 = new Date('2026-06-30T00:00:00');
  const endDate1 = new Date('2026-07-16T00:00:00');

  if (now >= startHalloween && now < endHalloween) {
    return HALLOWEEN_APP_LOGO;
  } else if (now >= startDate4 && now < endDate4) {
    return "https://d.top4top.io/p_3928xkymg1.png";
  } else if (now >= startDate3 && now < endDate3) {
    return "https://c.top4top.io/p_3917mkdmh1.png";
  } else if (now >= startDate2 && now < endDate2) {
    return "https://a.top4top.io/p_3856ltiqu1.png";
  } else if (now >= startDate1 && now < endDate1) {
    return "https://g.top4top.io/p_38330txup1.png";
  }

  return DEFAULT_APP_LOGO;
}
