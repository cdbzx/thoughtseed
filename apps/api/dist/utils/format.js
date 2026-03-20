"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitTags = splitTags;
function splitTags(value) {
    if (!value)
        return [];
    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}
