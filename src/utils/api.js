export const fetchActivities = async () => {
  const response = await fetch('/data/activities.json')
  return response.json()
}

export const fetchCourses = async () => {
  const response = await fetch('/data/courses.json')
  return response.json()
}

export const fetchRegions = async () => {
  const response = await fetch('/data/regions.json')
  return response.json()
}

export const fetchTypes = async () => {
  const response = await fetch('/data/types.json')
  return response.json()
}
