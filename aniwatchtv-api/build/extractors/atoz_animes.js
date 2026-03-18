"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractAtoZAnimes = void 0;
const extractAtoZAnimes = ($, selector) => {
    const animes = [];
    $(selector).each((_index, element) => {
        var _a, _b, _c;
        const href = $(element).find(".film-poster > a").attr("href");
        const id = (_a = href === null || href === void 0 ? void 0 : href.split("/").pop()) !== null && _a !== void 0 ? _a : null;
        const name = (_b = $(element).find(".dynamic-name").text().trim()) !== null && _b !== void 0 ? _b : null;
        const img = (_c = $(element).find(".film-poster img").attr("data-src")) !== null && _c !== void 0 ? _c : null;
        const eps = parseInt($(element).find(".tick-eps").text().trim()) || null;
        const sub = parseInt($(element).find(".tick-sub").text().trim()) || null;
        const dub = parseInt($(element).find(".tick-dub").text().trim()) || null;
        if (id && name && img) {
            animes.push({
                id,
                name,
                img,
                episodes: {
                    eps,
                    sub,
                    dub,
                },
            });
        }
        else {
            console.log("Missing data for one item:", { id, name, img });
        }
    });
    console.log("Extracted A-Z animes:", animes.length);
    return animes;
};
exports.extractAtoZAnimes = extractAtoZAnimes;
