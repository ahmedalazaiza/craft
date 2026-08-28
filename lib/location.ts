/**
 * Location utilities for Craft.
 * Includes curated global/regional cities and resilient client-side IP/Timezone auto-detection.
 */

export const POPULAR_CITIES = [
  "Worldwide",
  "Berlin, Germany",
  "Tokyo, Japan",
  "London, United Kingdom",
  "New York, USA",
  "San Francisco, USA",
  "Paris, France",
  "Amsterdam, Netherlands",
  "Copenhagen, Denmark",
  "Stockholm, Sweden",
  "Seoul, South Korea",
  "Dubai, UAE",
  "Riyadh, Saudi Arabia",
  "Cairo, Egypt",
  "Gaza, Palestine",
  "Ramallah, Palestine",
  "Jerusalem, Palestine",
  "Amman, Jordan",
  "Beirut, Lebanon",
  "Doha, Qatar",
  "Kuwait City, Kuwait",
  "Abu Dhabi, UAE",
  "Manama, Bahrain",
  "Muscat, Oman",
  "Toronto, Canada",
  "Vancouver, Canada",
  "Sydney, Australia",
  "Melbourne, Australia",
  "Singapore, Singapore",
  "Hong Kong",
  "Barcelona, Spain",
  "Madrid, Spain",
  "Milan, Italy",
  "Rome, Italy",
  "Zurich, Switzerland",
  "Geneva, Switzerland",
  "Vienna, Austria",
  "Oslo, Norway",
  "Helsinki, Finland",
  "Warsaw, Poland",
  "Prague, Czech Republic",
  "Kyiv, Ukraine",
  "Istanbul, Turkey",
  "Sao Paulo, Brazil",
  "Buenos Aires, Argentina",
  "Mexico City, Mexico",
  "Cape Town, South Africa",
  "Los Angeles, USA",
  "Seattle, USA",
  "Chicago, USA",
  "Austin, USA",
  "Bangkok, Thailand",
  "Taipei, Taiwan",
  "Lisbon, Portugal",
  "Dublin, Ireland",
  "Brussels, Belgium",
  "Kyoto, Japan",
];

const TIMEZONE_TO_LOCATION_MAP: Record<string, string> = {
  "Asia/Gaza": "Gaza, Palestine",
  "Asia/Hebron": "Ramallah, Palestine",
  "Asia/Jerusalem": "Jerusalem, Palestine",
  "Asia/Dubai": "Dubai, UAE",
  "Asia/Riyadh": "Riyadh, Saudi Arabia",
  "Asia/Amman": "Amman, Jordan",
  "Asia/Beirut": "Beirut, Lebanon",
  "Asia/Kuwait": "Kuwait City, Kuwait",
  "Asia/Qatar": "Doha, Qatar",
  "Asia/Bahrain": "Manama, Bahrain",
  "Asia/Muscat": "Muscat, Oman",
  "Africa/Cairo": "Cairo, Egypt",
  "Europe/Berlin": "Berlin, Germany",
  "Europe/London": "London, United Kingdom",
  "Europe/Paris": "Paris, France",
  "Europe/Amsterdam": "Amsterdam, Netherlands",
  "Europe/Copenhagen": "Copenhagen, Denmark",
  "Europe/Stockholm": "Stockholm, Sweden",
  "Europe/Rome": "Rome, Italy",
  "Europe/Madrid": "Madrid, Spain",
  "Europe/Zurich": "Zurich, Switzerland",
  "Europe/Vienna": "Vienna, Austria",
  "Asia/Tokyo": "Tokyo, Japan",
  "Asia/Seoul": "Seoul, South Korea",
  "Asia/Singapore": "Singapore, Singapore",
  "America/New_York": "New York, USA",
  "America/Los_Angeles": "Los Angeles, USA",
  "America/Chicago": "Chicago, USA",
  "America/Toronto": "Toronto, Canada",
  "America/Vancouver": "Vancouver, Canada",
  "Australia/Sydney": "Sydney, Australia",
  "Australia/Melbourne": "Melbourne, Australia",
};

/**
 * Resiliently detect the user's approximate location (City, Country).
 * 1. Tries fast IP-based Geolocation APIs with a short timeout.
 * 2. Falls back to Intl Timezone resolution if network fails or is blocked by privacy tools.
 */
export async function detectUserLocation(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  // 1. Try IP Geolocation API (ipwho.is - free, fast, CORS enabled, no API key needed)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2200);

    const res = await fetch("https://ipwho.is/", {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.city && data.country) {
        return `${data.city}, ${data.country}`;
      }
    }
  } catch {
    // Ignore network/abort errors and try secondary lookup
  }

  // 2. Secondary fast fallback: ipapi.co
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    const res = await fetch("https://ipapi.co/json/", {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.city && data.country_name) {
        return `${data.city}, ${data.country_name}`;
      }
    }
  } catch {
    // Ignore network/abort errors and fall back to Timezone
  }

  // 3. Fallback to Intl Timezone mapping
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone && TIMEZONE_TO_LOCATION_MAP[timeZone]) {
      return TIMEZONE_TO_LOCATION_MAP[timeZone];
    }
    // If timezone is formatted like "Region/City", extract the City
    if (timeZone && timeZone.includes("/")) {
      const parts = timeZone.split("/");
      const rawCity = parts[parts.length - 1].replace(/_/g, " ");
      return rawCity;
    }
  } catch {
    // Ignore
  }

  return null;
}
