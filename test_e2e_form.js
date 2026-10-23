/**
 * Live End-to-End Simulation:
 * Simulates complete team registration, gameplay score collection,
 * and submits live to the Google Forms API endpoint from data.md.
 */

const GOOGLE_FORM_ACTION_URL = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSf42vQBG3sz8M6FqKmtp1c6cicpbz0e2g6KVANuGanOypBCww/formResponse";

const testPayload = {
  "entry.2005620554": "Test Squad Alpha",     // team name
  "entry.760206339": "Player One",             // name1
  "entry.2064043736": "Player Two",            // name2
  "entry.2095619319": "25CS01",                // roll no1
  "entry.84977519": "25CS02",                  // roll no2
  "entry.1115565979": "9876543210",            // phone no1
  "entry.231797246": "120",                    // g1 (Game 1 Score)
  "entry.1866105115": "150",                   // g2 (Game 2 Score)
  "entry.892273308": "220",                    // g3 (Game 3 Score)
  "entry.921971514": "180",                    // g4 (Game 4 Score)
  "fvv": "1",
  "pageHistory": "0",
  "fbzx": "-3419578873572109492"
};

console.log("Submitting test payload to Google Form API...");
const body = new URLSearchParams(testPayload).toString();

fetch(GOOGLE_FORM_ACTION_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  body
})
.then(res => {
  console.log(`HTTP Status: ${res.status} ${res.statusText}`);
  if (res.status === 200) {
    console.log("✅ Google Form API successfully accepted and recorded the submission!");
  } else {
    console.log(`Response code: ${res.status}`);
  }
})
.catch(err => {
  console.error("Error submitting to Google Form:", err);
});
