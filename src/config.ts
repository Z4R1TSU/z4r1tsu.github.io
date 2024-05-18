import type { Site, SocialObjects, OG_Type } from "./types";

export const SITE: Site = {
  website: "https://z4r1tsu.github.io/",
  author: "Zari Tsu",
  desc: "Zari Tsu's blog",
  title: "Zari Tsu",
  lightAndDarkMode: true,
  postPerPage: 10,
  avatar: "https://bucket.liruifengv.com/avatar.jpg",
};

export const LOCALE = ["zh-CN"]; // set to [] to use the environment default

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/Z4R1TSU",
    linkTitle: `Zari Tsu's Github`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:zaritsu030907@gmail.com",
    linkTitle: `Send an email to Zari Tsu`,
    active: true,
  },
  {
    name: "BiliBili",
    href: "https://space.bilibili.com/527080131",
    linkTitle: `https://space.bilibili.com/527080131`,
    active: true,
  },
];

export const OG: OG_Type = {
  emojiType: "twemoji",
  // ogImage: "astropaper-og.jpg",
};

export const CND_URL: string = "https://bucket.liruifengv.com";
