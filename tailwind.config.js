/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 主視覺 tokens（極簡清單風・深色版）
        paper: '#131A1C',      // 全站底色：墨黑
        surface: '#1A2528',    // 卡片／表格底色
        ink: {
          DEFAULT: '#E8ECEA',  // 主要文字
          soft: '#9FB0B4',     // 次要文字
          faint: '#66787D',    // 淡文字／區塊標題
        },
        line: '#263135',       // 分隔線
        cond: {
          DEFAULT: '#D9BC6A',  // 條件標籤文字（琥珀）
          bg: '#2E2812',       // 條件標籤底色
        },
        // 既有語意色（填色搭配 text-paper 深色字）
        primary: '#4FB3CE',    // 品牌 teal
        secondary: '#72C6DC',  // 亮 teal（hover）
        accent: '#D9BC6A',     // 琥珀
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', '"PingFang TC"', '"Microsoft JhengHei"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
