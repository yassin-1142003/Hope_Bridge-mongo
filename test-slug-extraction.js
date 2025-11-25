// Test slug extraction logic
const testSlugs = [
  '69258ac770fdbf50830d5e26', // Direct ID
  'heating-pack-distribution-south-gaza-esdod-camp-69258ac770fdbf50830d5e26', // Full slug
  'winter-clothing-distribution-69258ac770fdbf50830d5e23', // Another slug
  'invalid-slug', // Invalid
];

function extractIdFromSlug(slug) {
  // UUID format: 8-4-4-4-12 characters (with hyphens)
  const uuidRegex = /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i;
  const match = slug.match(uuidRegex);

  if (match) {
    return match[1];
  }

  // Fallback: if no UUID found, try to match ObjectId format (24 hex chars)
  const objectIdRegex = /([a-f0-9]{24})$/i;
  const objectIdMatch = slug.match(objectIdRegex);
  
  if (objectIdMatch) {
    return objectIdMatch[1];
  }

  // Final fallback: if the entire slug is a valid ObjectId
  if (/^[a-f0-9]{24}$/i.test(slug)) {
    return slug;
  }

  return slug; // Return as-is if no pattern matches
}

console.log('🔍 Testing Slug Extraction Logic\n');

testSlugs.forEach(slug => {
  const extractedId = extractIdFromSlug(slug);
  console.log(`📝 Input: ${slug}`);
  console.log(`   🆔 Extracted ID: ${extractedId}`);
  console.log(`   ✅ Valid: ${/^[a-f0-9]{24}$/i.test(extractedId) ? 'YES' : 'NO'}`);
  console.log('');
});

console.log('🎯 Expected Results:');
console.log('   • Direct IDs should work');
console.log('   • Full slugs should extract the ID part');
console.log('   • Invalid slugs should return as-is');
