import activitiesData from '../../public/data/activities.json'
import coursesData from '../../public/data/courses.json'
import racesData from '../../public/data/races.json'
import regionsData from '../../public/data/regions.json'
import schoolsData from '../../public/data/schools.json'
import typesData from '../../public/data/types.json'

export const getActivities = () => activitiesData.activities || []

export const getCourses = () => coursesData.courses || []

export const getRaces = () => racesData.races || []

export const getRaceById = (id) => getRaces().find(race => race.id === id)

export const getRegions = () => regionsData.regions || []

export const getSchools = () => schoolsData.schools || []

export const getTypes = () => typesData.types || []

export const getSchoolById = (id) => getSchools().find(school => school.id === id)
