/**
 * Centralized verification status logic.
 * Handles both legacy boolean `true` and the new tri-state string values.
 */

export function isOrgVerified(verifiedValue) {
  return verifiedValue === true || verifiedValue === "verified";
}

export function getVerificationDisplay(verifiedValue) {
  if (verifiedValue === true || verifiedValue === "verified") {
    return { text: "Verified", colorClass: "bg-green-100 text-green-700" };
  }
  if (verifiedValue === "in_progress") {
    return { text: "In Review", colorClass: "bg-blue-100 text-blue-600" };
  }
  return { text: "Pending Verification", colorClass: "bg-yellow-100 text-yellow-700" };
}
