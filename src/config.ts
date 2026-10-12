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

  // 最新谷歌地图数据（同步时间 2026 年 10 月）
  rating: 4.5,
  reviewCount: '6,198',
  // 评价同步自谷歌地图的时间（用于页面来源说明，规避违规风险）
  reviewSyncAt: '2026 年 10 月 / October 2026 / ตุลาคม 2026',
  reviewSyncShort: '2026-10',

  // 实际坐标（用于天气 / 日落 API 与地图嵌入）—— Mae Kampong Village, Huai Kaeo, Mae On, Chiang Mai
  coords: { lat: 18.8642, lng: 99.3498 },

  // 统一 Google Maps 链接（首屏 / 照片 / 评价 / 页脚 共 4 处 + JSON-LD sameAs）
  mapsUrl: 'https://maps.app.goo.gl/CJABCvJdCDW68ttP9',

  // 地图嵌入（MapSection iframe，使用用户提供的 Mae Kampong Village Google Maps 嵌入代码）
  googleMapsEmbed:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6548.108592624014!2d99.35098459999999!3d18.8655073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30d98daae0d4efab%3A0xfdb15823a3d37b6d!2sMae%20Kampong%20Village!5e1!3m2!1sen!2s!4v1789374077305!5m2!1sen!2s',

  // ============================================================
  // 单景点 SEO 实体绑定（Entity Binding）—— 全站唯一数据源
  // 对应模板变量：
  //   DOMAIN_NAME            -> visitmaekampong.com
  //   ATTRACTION_FULL_NAME   -> Mae Kampong Village
  //   ATTRACTION_SHORT_NAME  -> Mae Kampong
  //   CITY_NAME              -> Chiang Mai
  //   STATE_PROVINCE         -> Chiang Mai Province
  //   COUNTRY_NAME           -> Thailand
  //   COUNTRY_CODE_2LETTER   -> TH
  //   POSTAL_CODE            -> 50130
  //   LATITUDE / LONGITUDE   -> 18.8642 / 99.3498
  //   MAPS_SHARE_URL         -> https://maps.app.goo.gl/CJABCvJdCDW68ttP9
  //   MAPS_EMBED_SRC         -> googleMapsEmbed
  //   NEARBY_LANDMARK_1 / 2  -> Mae Kampong Waterfall / San Kamphaeng Hot Springs
  //   GOVT_TOURISM_URL       -> https://www.tourismthailand.org/
  // ============================================================
  entity: {
    domainName: 'visitmaekampong.com',
    fullName: 'Mae Kampong Village',
    shortName: 'Mae Kampong',
    // 其他语言写法，用于 alternateName
    alternateNames: ['หมู่บ้านแม่กำปอง', '湄甘蓬村', '湄康蓬村', 'Mae Kampong Chiang Mai'],
    city: 'Chiang Mai',
    district: 'Mae On',
    subDistrict: 'Huai Kaeo',
    stateProvince: 'Chiang Mai Province',
    country: 'Thailand',
    countryCode: 'TH',
    postalCode: '50130',
    latitude: 18.8642,
    longitude: 99.3498,
    mapsShareUrl: 'https://maps.app.goo.gl/CJABCvJdCDW68ttP9',
    nearbyLandmark1: 'Mae Kampong Waterfall',
    nearbyLandmark2: 'San Kamphaeng Hot Springs',
    govtTourismUrl: 'https://www.tourismthailand.org/',
    // PWA / 主题色
    themeColor: '#071a1c',
    backgroundColor: '#f5ecd7',
  },

  // Google Analytics 4 衡量 ID
  ga4Id: 'G-HXM22WWPKP',

  // 结构化数据 sameAs（权威资料页）
  sameAs: [
    'https://maps.app.goo.gl/CJABCvJdCDW68ttP9',
    'https://www.tourismthailand.org/',
  ],

  address: 'V982+695, Huai Kaeo, Mae On District, Chiang Mai 50130, Thailand',
  plusCode: 'V982+695',

  // JSON-LD / OG 使用的首图（必须是可通过公网访问的可抓取图片）
  heroImage: '/gallery/mae-kampong-village-1.webp',

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
      name: { th: 'การท่องเที่ยวแห่งประเทศไทย', en: 'Tourism Authority of Thailand', zh: '泰國國家旅遊局' },
      url: 'https://www.tourismthailand.org/',
    },
    {
      name: { th: 'จังหวัดเชียงใหม่', en: 'Chiang Mai Province', zh: '清邁府' },
      url: 'https://www.chiangmai.go.th/',
    },
    {
      name: { th: 'Google Maps', en: 'Google Maps', zh: 'Google 地圖' },
      url: 'https://maps.app.goo.gl/CJABCvJdCDW68ttP9',
    },
  ],
};
