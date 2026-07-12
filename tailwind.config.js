/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主視覺 tokens（極簡清單風）
        paper: '#FAFAF7',      // 全站底色：暖米白
        ink: {
          DEFAULT: '#1F2A2E',  // 主要文字
          soft: '#5A6B70',     // 次要文字
          faint: '#93A1A5',    // 淡文字／區塊標題
        },
        line: '#E5E8E4',       // 分隔線
        cond: {
          DEFAULT: '#8A6D1F',  // 條件標籤文字（琥珀）
          bg: '#F5EDD4',       // 條件標籤底色
        },
        // 既有語意色重新對應（讓舊 class 直接換膚）
        primary: '#0E7490',    // 品牌 teal
        secondary: '#155E75',  // 深 teal
        accent: '#8A6D1F',     // 琥珀
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', '"PingFang TC"', '"Microsoft JhengHei"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
