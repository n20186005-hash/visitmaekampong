export const siteConfig = {
  // 多语言名称（站点名 / 当地名）
  name: {
    th: 'หมู่บ้านแม่กำปอง',
    en: 'Mae Kampong Village',
    zh: '湄甘蓬村（Mae Kampong Village）',
  },
  nameLocal: 'หมู่บ้านแม่กำปอง', // 当地（泰文）名称
  domain: 'https://visitmaekampong.com', // 含协议，用于 canonical / og:image / hreflang

  // 联系 / 应急电话（无官方单线，此处使用泰国国家旅游局清迈办事处）
  phone: '+6653248604',
  phoneDisplay: '+66 53 248 604',

  rating: 4.5,
  reviewCount: '5,904',

  // 实际坐标（用于天气 / 日落 API 与地图嵌入）—— Mae Kampong Village, Huai Kaeo, Mae On, Chiang Mai
  coords: { lat: 18.8642, lng: 99.3498 },

  // 统一 Google Maps 链接（首屏 / 照片 / 评价 / 页脚 共 4 处 + JSON-LD sameAs）
  mapsUrl: 'https://maps.app.goo.gl/CJABCvJdCDW68ttP9',

  // 地图嵌入（MapSection iframe，使用用户提供的 Mae Kampong Village Google Maps 嵌入代码）
  googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3775.515520125258!2d99.34980151232739!3d18.864197782223485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30d98daae0d4efab%3A0xfdb15823a3d37b6d!2sMae%20Kampong%20Village!5e0!3m2!1szh-CN!2sus!4v1784693467552!5m2!1szh-CN!2sus',

  // 结构化数据 sameAs（权威资料页）
  sameAs: [
    'https://maps.app.goo.gl/CJABCvJdCDW68ttP9',
    'https://www.tourismthailand.org/',
  ],

  address: 'V982+695, Huai Kaeo, Mae On District, Chiang Mai 50130, Thailand',
  plusCode: 'V982+695',

  // 画廊图片前缀（配合 public/gallery/mae-kampong-village-1..N.webp）
  galleryPrefix: 'mae-kampong-village-',
  // 画廊图片扩展名（由 scripts/optimize-gallery.mjs 构建期生成 WebP）
  galleryExt: 'webp',

  // 社交 / 资料链接（科普站占位，上线前请替换为官方或可运营账号）
  socialLinks: [
    {
      name: 'Tourism Thailand',
      href: 'https://www.tourismthailand.org/',
      icon: 'globe',
    },
    {
      name: 'Chiang Mai Province',
      href: 'https://www.chiangmai.go.th/',
      icon: 'tree',
    },
    {
      name: 'Google Maps',
      href: 'https://maps.app.goo.gl/CJABCvJdCDW68ttP9',
      icon: 'map',
    },
  ],

  // 资料来源（页脚引用，需与页脚 per-language name 结构一致）
  sources: [
    {
      name: { th: 'การท่องเที่ยวแห่งประเทศไทย', en: 'Tourism Authority of Thailand', zh: '泰国国家旅游局' },
      url: 'https://www.tourismthailand.org/',
    },
    {
      name: { th: 'จังหวัดเชียงใหม่', en: 'Chiang Mai Province', zh: '清迈府' },
      url: 'https://www.chiangmai.go.th/',
    },
    {
      name: { th: 'Google Maps', en: 'Google Maps', zh: 'Google 地图' },
      url: 'https://maps.app.goo.gl/CJABCvJdCDW68ttP9',
    },
  ],
};
