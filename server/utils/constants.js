export const TWEAK_MAX_LENGTH = 128;

export const BLOCKED_PATTERNS = [
    /--/,
    /[;`]/,
    /\beval\b/,
    /\bexec\b/,
    /\bexecCommand\b/,
    /\bexecScript\b/,
    /\bsetImmediate\b/,
    /\bFunction\b/,
    /\bsetTimeout\b/,
    /\bsetInterval\b/,
    /\bimport\b/,
    /\brequire\b/,
    /\bprocess\b/,
    /\bglobal\b/,
    /\bwindow\b/,
    /\bdocument\b/,
    /\bconsole\b/,
    /\b__proto__\b/,
    /\bconstructor\b/ 
];
