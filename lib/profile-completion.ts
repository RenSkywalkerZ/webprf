export const calculateProfileCompletion = (userData: any) => {
  if (!userData) return 0

  let address = userData.address
  if (typeof address === "string") {
    try {
      address = JSON.parse(address)
    } catch (e) {
      address = {}
    }
  } else if (typeof address !== 'object' || address === null) {
    address = {}
  }

  const requiredFields = [
    userData.full_name,
    userData.email,
    userData.phone,
    userData.birth_date,
    address.street,
    address.village,
    address.district,
    address.city,
    address.province,
    userData.education_level,
    userData.gender,
  ]

  if (userData.education_level && userData.education_level !== "umum") {
    requiredFields.push(userData.school)
  }

  const completedFields = requiredFields.filter((field) => {
    if (typeof field === 'string') {
      return field.trim() !== ""
    }
    return field != null
  }).length

  const totalFields = requiredFields.length
  const completion = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0
  return completion
}
