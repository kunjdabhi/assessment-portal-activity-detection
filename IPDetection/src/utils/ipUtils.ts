export function getBrowserName(): string {
    const ua = navigator.userAgent;

    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
    if (ua.includes("Edg")) return "Edge";

    return "Unknown";
}

export function getOSName(): string {
    const platform = navigator.platform;

    if (platform.startsWith("Win")) return "Windows";
    if (platform.startsWith("Mac")) return "macOS";
    if (platform.startsWith("Linux")) return "Linux";

    return "Unknown";
}