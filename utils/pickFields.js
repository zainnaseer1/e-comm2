//
//
//
//

// utility function to pick allowed fields from an object
function pickFields(obj, allowed) {
  //converting json key value to object
  return Object.fromEntries(
    // Convert object to array of [key, value] pairs
    // then filter the pairs to keep only those with keys in the allowed list
    Object.entries(obj).filter(([key]) => allowed.includes(key)), // Keep only entries where key is in allowed array
  );
}

module.exports = pickFields;
