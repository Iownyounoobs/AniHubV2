"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectCountry = detectCountry;
function detectCountry(studios) {
    const names = studios.map(s => s.toLowerCase());
    const japaneseStudios = [
        "a-1 pictures", "toei animation", "toei", "mappa", "ufotable",
        "kyoto animation", "bones", "wit studio", "cloverworks", "studio deen",
        "production i.g", "madhouse", "sunrise", "j.c.staff", "brain's base",
        "doga kobo", "feel.", "silver link", "bridge", "8bit", "trigger",
        "passione", "lerche", "david production", "pierrot", "kinema citrus",
        "studio gokumi", "seven arcs", "diomedea", "tms entertainment",
        "nippon animation", "gonzo", "studio kai", "p.a. works", "satelight",
        "studio bind", "project no.9", "children's playground entertainment",
        "telecom animation film", "studio hibari", "polygon pictures",
        "white fox", "hook", "studio mir",
    ];
    const chineseStudios = [
        // Streaming giants / publishers
        "tencent", "tencent penguin", "tencent animation", "tencent video",
        "bilibili", "iqiyi", "youku", "mangguo tv",
        // Production studios
        "haoliners", "xing yi kai chen", "build dream", "bigfirebird",
        "colored pencil animation", "studio lan", "soyep", "cg year",
        "bedream", "kjj animation", "foch film", "shanghai motion magic",
        "wawayu animation", "sparkly key animation studio",
        "nice boat animation", "lingsanwu animation", "emon",
        "boco animation", "ipartment", "comix wave",
        "beijing enlight pictures", "shanghai yueliang", "ruo hong culture",
        "fanworks", "mtjj", "b.cmay pictures",
        "sirius animation", "le vision pictures", "dongyang motie",
        "artcraft", "emon animation", "g.cmay animation",
        "yuewen animation", "motion magic",
        // Additional Chinese studios
        "chinese", "china", "cn animation", "ruo hong",
        "ifilm", "manhwa", "manhua",
        "xincheng animated", "shengkai animation", "aurora animation",
        "zhong", "beijing", "shanghai", "shenzhen", "chengdu",
        "nanjing", "guangzhou", "wuhan", "hangzhou",
        "fox animation studio", "anhui", "jiangsu",
        "suzhou", "sichuan", "tianjin", "dongguan",
    ];
    if (names.some(n => japaneseStudios.some(j => n.includes(j))))
        return "Japan";
    if (names.some(n => chineseStudios.some(c => n.includes(c))))
        return "China";
    return "Unknown";
}
