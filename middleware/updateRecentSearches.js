const User = require("../models/user");

// Add a method to update recent searches for a user
async function updateRecentSearches(email, searchQuery) {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }
    
    // Ensure the recentSearches array exists and is an array
    user.recentSearches = user.recentSearches || [];

    // Check if the search query already exists in the recentSearches array
    const existingIndex = user.recentSearches.indexOf(searchQuery);

    if (existingIndex !== -1) {
      // If the search query exists, remove it from its current position
      user.recentSearches.splice(existingIndex, 1);
    }

    // Add the search query to the beginning of the recentSearches array
    user.recentSearches.unshift(searchQuery);

    // Ensure the recentSearches array does not exceed 5 items
    if (user.recentSearches.length > 5) {
      // If more than 5 items, remove the excess items from the end of the array
      user.recentSearches = user.recentSearches.slice(0, 5);
    }

    // Save the updated user document
    await user.save();
  } catch (error) {
    console.error('Error updating recent searches:', error);
    throw error;
  }
}

module.exports = updateRecentSearches;
