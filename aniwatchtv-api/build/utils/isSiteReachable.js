"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSiteReachable = void 0;
/**
 * Checks if a site is reachable via a HEAD request.
 * Returns `true` if the status code is 2xx, otherwise `false`.
 */
const isSiteReachable = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout
        const response = yield fetch(url, {
            method: "GET",
            signal: controller.signal,
        });
        clearTimeout(timeout);
        return response.ok;
    }
    catch (error) {
        console.warn(`Site unreachable: ${url}`);
        return false;
    }
});
exports.isSiteReachable = isSiteReachable;
