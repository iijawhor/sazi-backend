export const searchQuery = async (
  model,
  query,
  fieldsArray,
  page = 1,
  limit = 15
) => {
  if (!query || query.length < 3) {
    return [];
  }

  const skip = (page - 1) * limit;

  const searchConditions = fieldsArray.map((field) => ({
    [field]: { $regex: query, $options: "i" }
  }));

  const results = await model
    .find({ $or: searchConditions })
    .select("firstName lastName email phoneNumber role") // ✅ Return only needed fields
    .skip(skip)
    .limit(limit)
    .lean(); // ✅ Convert to plain JS object for better performance

  return results;
};
