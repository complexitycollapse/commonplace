export default async function jsonParse(response, origin) {
  try {
    return await response.json();
  } catch (ex) {
    console.error(`Error attempting to parse JSON for ${origin}: ${ex.message}`);
    throw ex;
  }
}
