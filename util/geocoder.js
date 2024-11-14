import NodeGeocoder from "node-geocoder";

// Options for the geocoder
const options = {
  provider: "openstreetmap",
  formatter: null, // 'gpx', 'string', ...
};

// Create a geocoder instance
const geocoder = NodeGeocoder(options);

// Function to get coordinates based on place name or address
async function getCoordinates(placeName) {
  try {
    const res = await geocoder.geocode(placeName);
    if (res.length > 0) {
      const { latitude, longitude } = res[0];
      console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);
    } else {
      console.log("No results found");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

// Replace 'PLACE_NAME_OR_ADDRESS' with the actual place name or address you want to search for

export default getCoordinates;
