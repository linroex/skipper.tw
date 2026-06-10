#!/usr/bin/env python3
"""
課程與活動資料檢查工具
檢查重複課程、遺漏學校、格式錯誤等
"""

import json
import sys
import re
from pathlib import Path
from collections import defaultdict

# 資料檔案路徑
DATA_DIR = Path(__file__).parent.parent / "public" / "data"
COURSES_FILE = DATA_DIR / "courses.json"
ACTIVITIES_FILE = DATA_DIR / "activities.json"
SCHOOLS_FILE = DATA_DIR / "schools.json"


def load_json(filepath):
    """載入 JSON 檔案"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(filepath, data):
    """保存 JSON 檔案"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')


def generate_school_id(name):
    """生成學校 ID（小寫，無空格和特殊字元）"""
    return re.sub(r'[^a-z0-9]', '', name.lower())


def check_duplicate_courses(courses):
    """檢查重複課程"""
    print("\n" + "=" * 60)
    print("📋 檢查重複課程")
    print("=" * 60)
    
    # 確保 courses 是一個字典，包含 courses 鍵
    if isinstance(courses, dict):
        courses_list = courses.get('courses', [])
    else:
        courses_list = courses
    
    seen = {}
    duplicates = []
    
    for course in courses_list:
        if not isinstance(course, dict):
            continue
        key = (
            course.get('unit', ''),
            course.get('title', ''),
            course.get('startDate', ''),
            course.get('endDate', '')
        )
        if key in seen:
            duplicates.append({
                'original': seen[key],
                'duplicate': course,
                'key': key
            })
        else:
            seen[key] = course
    
    if duplicates:
        print(f"❌ 發現 {len(duplicates)} 組重複課程")
        for dup in duplicates:
            print(f"\n重複鍵：{dup['key']}")
            print(f"原始課程 (id={dup['original']['id']}):")
            print(f"  {dup['original']['title']}")
            print(f"  日期：{dup['original'].get('startDate')} - {dup['original'].get('endDate')}")
            print(f"  地點：{dup['original'].get('location')}")
            print(f"重複課程 (id={dup['duplicate']['id']}):")
            print(f"  {dup['duplicate']['title']}")
            print(f"  日期：{dup['duplicate'].get('startDate')} - {dup['duplicate'].get('endDate')}")
            print(f"  地點：{dup['duplicate'].get('location')}")
    else:
        print("✅ 沒有發現重複課程")
    
    return duplicates


def check_missing_schools(courses, activities, schools_data):
    """檢查課程和活動中是否有未定義的學校"""
    print("\n" + "=" * 60)
    print("🏫 檢查未定義的學校")
    print("=" * 60)
    
    # 確保 courses 是一個字典
    if isinstance(courses, dict):
        courses_list = courses.get('courses', [])
    else:
        courses_list = courses
    
    # 確保 activities 是一個字典
    if isinstance(activities, dict):
        activities_list = activities.get('activities', [])
    else:
        activities_list = activities
    
    # 建立學校名稱集合
    existing_schools = {school['name'] for school in schools_data.get('schools', [])}
    
    # 收集所有單位名稱
    units_in_courses = set()
    units_in_activities = set()
    
    for course in courses_list:
        if isinstance(course, dict) and course.get('unit'):
            units_in_courses.add(course['unit'])
    
    for activity in activities_list:
        if isinstance(activity, dict) and activity.get('unit'):
            units_in_activities.add(activity['unit'])
    
    all_units = units_in_courses | units_in_activities
    missing = all_units - existing_schools
    
    if missing:
        print(f"❌ 發現 {len(missing)} 個未定義的學校")
        print("\n建議新增到 schools.json:")
        print("-" * 60)
        
        for unit in sorted(missing):
            school_id = generate_school_id(unit)
            short_name = unit[:min(8, len(unit))]
            
            # 從課程中提取認證類型
            certs = set()
            for course in courses.get('courses', []):
                if course.get('unit') == unit and course.get('organization'):
                    certs.add(course['organization'])
            
            # 從課程中提取地點
            locations = set()
            for course in courses.get('courses', []):
                if course.get('unit') == unit and course.get('location'):
                    locations.add(course['location'])
            
            print(f"\n建議新增:")
            print(f"  {{")
            print(f'    "id": "{school_id}",')
            print(f'    "name": "{unit}",')
            print(f'    "shortName": "{short_name}",')
            print(f'    "description": "待補充學校描述",')
            print(f'    "certs": {list(certs) if certs else ["ASA"]},')
            print(f'    "locations": {list(locations) if locations else []}')
            print(f"  }}")
    else:
        print("✅ 所有學校都已在 schools.json 中定義")
    
    return list(missing)


def check_course_format(courses):
    """檢查課程格式"""
    print("\n" + "=" * 60)
    print("📝 檢查課程格式")
    print("=" * 60)
    
    # 確保 courses 是一個字典
    if isinstance(courses, dict):
        courses_list = courses.get('courses', [])
    else:
        courses_list = courses
    
    issues = []
    valid_regions = ['北台灣', '中台灣', '南台灣', '東台灣']
    valid_levels = ['beginner', 'intermediate', 'advanced']
    
    for course in courses_list:
        if not isinstance(course, dict):
            continue
        # 檢查日期格式
        date_fields = ['startDate', 'endDate', 'date']
        for field in date_fields:
            if field in course and course[field]:
                if not re.match(r'^\d{4}-\d{2}-\d{2}$', course[field]):
                    issues.append(f"課程 id={course['id']}: {field} 格式錯誤 ({course[field]})")
        
        # 檢查地區
        if 'region' in course and course['region']:
            if course['region'] not in valid_regions:
                issues.append(f"課程 id={course['id']}: 地區錯誤 ({course['region']})")
        
        # 檢查等級
        if 'level' in course and course['level']:
            if course['level'] not in valid_levels:
                issues.append(f"課程 id={course['id']}: 等級錯誤 ({course['level']})")
    
    if issues:
        print(f"❌ 發現 {len(issues)} 個格式問題:")
        for issue in issues:
            print(f"  - {issue}")
    else:
        print("✅ 所有課程格式正確")
    
    return issues


def check_activity_format(activities):
    """檢查活動格式"""
    print("\n" + "=" * 60)
    print("📝 檢查活動格式")
    print("=" * 60)
    
    # 確保 activities 是一個字典
    if isinstance(activities, dict):
        activities_list = activities.get('activities', [])
    else:
        activities_list = activities
    
    issues = []
    valid_regions = ['北台灣', '中台灣', '南台灣', '東台灣']
    valid_types = ['workshop', 'race', 'camp', 'seminar']
    
    for activity in activities_list:
        if not isinstance(activity, dict):
            continue
        # 檢查日期格式
        if 'date' in activity and activity['date']:
            if not re.match(r'^\d{4}-\d{2}-\d{2}$', activity['date']):
                issues.append(f"活動 id={activity['id']}: date 格式錯誤")
        
        # 檢查地區
        if 'region' in activity and activity['region']:
            if activity['region'] not in valid_regions:
                issues.append(f"活動 id={activity['id']}: 地區錯誤 ({activity['region']})")
        
        # 檢查類型
        if 'type' in activity and activity['type']:
            if activity['type'] not in valid_types:
                issues.append(f"活動 id={activity['id']}: 類型錯誤 ({activity['type']})")
    
    if issues:
        print(f"❌ 發現 {len(issues)} 個格式問題:")
        for issue in issues:
            print(f"  - {issue}")
    else:
        print("✅ 所有活動格式正確")
    
    return issues


def main():
    """主函式"""
    print("🔍 開始檢查課程與活動資料...")
    
    # 載入資料
    try:
        courses = load_json(COURSES_FILE)
        activities = load_json(ACTIVITIES_FILE)
        schools = load_json(SCHOOLS_FILE)
    except FileNotFoundError as e:
        print(f"❌ 檔案不存在：{e}")
        sys.exit(1)
    
    # 執行檢查
    check_duplicate_courses(courses)
    check_missing_schools(courses, activities, schools)
    check_course_format(courses)
    check_activity_format(activities)
    
    # 統計資訊
    print("\n" + "=" * 60)
    print("📊 統計資訊")
    print("=" * 60)
    print(f"課程總數：{len(courses.get('courses', []))}")
    print(f"活動總數：{len(activities.get('activities', []))}")
    print(f"學校總數：{len(schools.get('schools', []))}")
    
    # 按學校統計課程
    school_stats = defaultdict(int)
    for course in courses.get('courses', []):
        if course.get('unit'):
            school_stats[course['unit']] += 1
    
    print("\n按學校統計課程:")
    for unit, count in sorted(school_stats.items(), key=lambda x: -x[1]):
        print(f"  {unit}: {count} 筆課程")
    
    print("\n✅ 檢查完成！")


if __name__ == '__main__':
    main()
