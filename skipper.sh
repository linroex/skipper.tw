#!/bin/bash

# Skipper.tw 專案管理腳本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

show_help() {
    echo "Skipper.tw 專案管理工具"
    echo ""
    echo "使用方式:"
    echo "  ./skipper.sh <命令>"
    echo ""
    echo "命令:"
    echo "  check        檢查課程和活動資料"
    echo "  dev          啟動開發伺服器"
    echo "  build        建置生產版本"
    echo "  preview      預覽生產版本"
    echo "  schools      顯示學校統計"
    echo "  courses      顯示課程統計"
    echo "  help         顯示此說明"
    echo ""
}

check_data() {
    echo "🔍 檢查課程和活動資料..."
    python3 scripts/check-data.py
}

show_schools() {
    echo "🏫 學校統計"
    echo ""
    python3 -c "
import json
from collections import defaultdict

courses = json.load(open('public/data/courses.json'))
schools = json.load(open('public/data/schools.json'))

school_stats = defaultdict(int)
for course in courses['courses']:
    if course.get('unit'):
        school_stats[course['unit']] += 1

for school in schools['schools']:
    name = school['name']
    count = school_stats.get(name, 0)
    locations = ', '.join(school.get('locations', []))
    print(f'{name} - {count} 筆課程 | 地點：{locations}')
"
}

show_courses() {
    echo "📚 課程統計"
    echo ""
    python3 -c "
import json
from collections import defaultdict

courses = json.load(open('public/data/courses.json'))

by_org = defaultdict(int)
by_region = defaultdict(int)

for course in courses['courses']:
    if course.get('organization'):
        by_org[course['organization']] += 1
    if course.get('region'):
        by_region[course['region']] += 1

print('按認證組織:')
for org, count in sorted(by_org.items(), key=lambda x: -x[1]):
    print(f'  {org}: {count} 筆課程')

print()
print('按地區:')
for region, count in sorted(by_region.items()):
    print(f'  {region}: {count} 筆課程')

print()
print(f'總課程數：{len(courses[\"courses\"])}')
"
}

case "$1" in
    check)
        check_data
        ;;
    schools)
        show_schools
        ;;
    courses)
        show_courses
        ;;
    dev)
        npm run dev
        ;;
    build)
        npm run build
        ;;
    preview)
        npm run preview
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "❌ 未知命令：$1"
        echo ""
        show_help
        exit 1
        ;;
esac
