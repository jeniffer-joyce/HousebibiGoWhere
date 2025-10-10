export async function searchWithGemini(query, businesses) {
  // Smart keyword search (no AI needed)
  const queryLower = query.toLowerCase();
  const keywords = queryLower.split(' ');
  
  return businesses.filter(business => {
    const searchText = `${business.name} ${business.description || ''} ${business.category || ''}`.toLowerCase();
    
    // Check if any keyword matches
    return keywords.some(keyword => searchText.includes(keyword));
  });
}