const dataPath = (filename) => `${import.meta.env.BASE_URL}data/${filename}`

export const fetchActivities = async () => {
  const response = await fetch(dataPath('activities.json'))
  return response.json()
}

export const fetchCourses = async () => {
  const response = await fetch(dataPath('courses.json'))
  return response.json()
}

export const fetchRegions = async () => {
  const response = await fetch(dataPath('regions.json'))
  return response.json()
}

export const fetchTypes = async () => {
  const response = await fetch(dataPath('types.json'))
  return response.json()
}

export const fetchSchools = async () => {
  const response = await fetch(dataPath('schools.json'))
  return response.json()
}
