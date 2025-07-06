export const calculateProfileCompletion = (userData: any) => {
  if (!userData) return 0;

  // Handle admin case separately
  if (userData.role === "admin") {
    const adminFields = [userData.full_name, userData.email];
    const completedAdminFields = adminFields.filter(f => f && String(f).trim()).length;
    return adminFields.length > 0 ? Math.round((completedAdminFields / adminFields.length) * 100) : 100;
  }

  // Parse address, which might be a JSON string
  let address = userData.address;
  if (typeof address === 'string') {
    try {
      address = JSON.parse(address);
    } catch (e) {
      address = {}; // Default to empty object on parsing error
    }
  } else if (typeof address !== 'object' || address === null) {
    address = {}; // Default if it's not an object
  }

  const allProfileFields = [
    userData.full_name,
    userData.nickname,
    userData.email,
    userData.phone,
    userData.date_of_birth,
    address.street,
    address.rtRw,
    address.village,
    address.district,
    address.city,
    address.province,
    address.postalCode,
    userData.education_level,
    userData.gender,
    userData.student_id,
    userData.identity_type,
  ];

  // Conditionally add school/grade based on education level
  if (userData.education_level && userData.education_level !== "umum") {
    allProfileFields.push(userData.school);
    allProfileFields.push(userData.grade);
  }

  const completedFields = allProfileFields.filter(field => {
    if (typeof field === 'string') return field.trim() !== '';
    return field != null;
  }).length;

  return allProfileFields.length > 0 ? Math.round((completedFields / allProfileFields.length) * 100) : 0;
};
