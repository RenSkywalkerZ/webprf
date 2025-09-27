// lib/cloudinary-debug.ts
import cloudinary from "./cloudinary"

export async function debugCloudinaryFile(publicId: string) {
  console.log("=== CLOUDINARY DEBUG ===")
  console.log("Public ID:", publicId)
  
  const resourceTypes = ['image', 'raw', 'video']
  
  for (const resourceType of resourceTypes) {
    try {
      console.log(`\n--- Checking ${resourceType.toUpperCase()} ---`)
      
      // Coba get resource info
      const info = await cloudinary.api.resource(publicId, {
        resource_type: resourceType
      })
      
      console.log(`✅ Found in ${resourceType}:`)
      console.log("- URL:", info.secure_url)
      console.log("- Format:", info.format)
      console.log("- Size:", info.bytes)
      console.log("- Created:", info.created_at)
      
      return { found: true, resourceType, info }
      
    } catch (error: any) {
      if (error.http_code === 404) {
        console.log(`❌ Not found in ${resourceType}`)
      } else {
        console.log(`⚠️  Error checking ${resourceType}:`, error.message)
      }
    }
  }
  
  console.log("❌ File not found in any resource type")
  return { found: false }
}

// Untuk mengecek semua files di folder tertentu
export async function listCloudinaryFiles(folder: string) {
  try {
    console.log(`=== LISTING FILES IN FOLDER: ${folder} ===`)
    
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: 100
    })
    
    console.log(`Found ${result.resources.length} files:`)
    result.resources.forEach((resource: any, index: number) => {
      console.log(`${index + 1}. ${resource.public_id}`)
      console.log(`   - URL: ${resource.secure_url}`)
      console.log(`   - Type: ${resource.resource_type}`)
      console.log(`   - Format: ${resource.format}`)
    })
    
    return result.resources
  } catch (error) {
    console.error("Error listing files:", error)
    return []
  }
}