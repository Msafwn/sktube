import xss from "xss";

/**
 * 1. Clean XSS characters from strings & nested objects
 */
const sanitizeXSS = (value) => {
    if (typeof value === "string") {
        return xss(value.trim());
    }
    if (Array.isArray(value)) {
        return value.map((item) => sanitizeXSS(item));
    }
    if (value !== null && typeof value === "object") {
        const cleanObj = {};
        for (const [key, val] of Object.entries(value)) {
            cleanObj[key] = sanitizeXSS(val);
        }
        return cleanObj;
    }
    return value;
};

/**
 * 2. Strip NoSQL Injection operators ($ and .) from objects
 */
const sanitizeNoSQL = (obj) => {
    if (obj !== null && typeof obj === "object") {
        if (Array.isArray(obj)) {
            obj.forEach((item) => sanitizeNoSQL(item));
        } else {
            for (const key of Object.keys(obj)) {
                // If key starts with $ (MongoDB query operator) or contains ., delete it
                if (key.startsWith("$") || key.includes(".")) {
                    delete obj[key];
                } else if (typeof obj[key] === "object") {
                    sanitizeNoSQL(obj[key]);
                }
            }
        }
    }
};

/**
 * 3. Express 5 Compatible Security Sanitization Middleware
 * - Strips NoSQL query injection ($ne, $gt, etc.)
 * - Cleans XSS scripts from user inputs
 * - Protects against HTTP Parameter Pollution (HPP) by taking single values
 */
export const securitySanitizer = (req, res, next) => {
    // 1. Sanitize Body (NoSQL & XSS)
    if (req.body && typeof req.body === "object") {
        sanitizeNoSQL(req.body);
        req.body = sanitizeXSS(req.body);
    }

    // 2. Sanitize Params
    if (req.params && typeof req.params === "object") {
        sanitizeNoSQL(req.params);
        req.params = sanitizeXSS(req.params);
    }

    // 3. Sanitize Query (Express 5 Safe in-place mutation)
    if (req.query && typeof req.query === "object") {
        sanitizeNoSQL(req.query);
        for (const [key, val] of Object.entries(req.query)) {
            // HPP guard: if parameter is duplicated into an array (e.g. ?page=1&page=2), pick the last element
            if (Array.isArray(val)) {
                req.query[key] = sanitizeXSS(val[val.length - 1]);
            } else if (typeof val === "string") {
                req.query[key] = sanitizeXSS(val);
            }
        }
    }

    next();
};
