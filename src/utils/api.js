const dataPath = (filename) => `${import.meta.env.BASE_URL}data/${filename}`

const fetchJson = async (filename) => {
  const response = await fetch(dataPath(filename))
  if (!response.ok) {
    throw new Error(`Failed to load ${filename}: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export const fetchActivities = () => fetchJson('activities.json')

export const fetchCourses = () => fetchJson('courses.json')

export const fetchRegions = () => fetchJson('regions.json')

export const fetchTypes = () => fetchJson('types.json')

export const fetchSchools = () => fetchJson('schools.json')
