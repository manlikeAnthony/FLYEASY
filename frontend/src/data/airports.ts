export type Airport = { code: string; city: string; name: string; country: string };
export const airports: Airport[] = [
  {code:"LOS",city:"Lagos",name:"Murtala Muhammed International",country:"Nigeria"},
  {code:"ABV",city:"Abuja",name:"Nnamdi Azikiwe International",country:"Nigeria"},
  {code:"PHC",city:"Port Harcourt",name:"Port Harcourt International",country:"Nigeria"},
  {code:"KAN",city:"Kano",name:"Mallam Aminu Kano International",country:"Nigeria"},
  {code:"ENU",city:"Enugu",name:"Akanu Ibiam International",country:"Nigeria"},
  {code:"QOW",city:"Owerri",name:"Sam Mbakwe International",country:"Nigeria"},
  {code:"BNI",city:"Benin City",name:"Benin Airport",country:"Nigeria"},
  {code:"QUO",city:"Uyo",name:"Victor Attah International",country:"Nigeria"},
  {code:"LHR",city:"London",name:"Heathrow",country:"United Kingdom"},
  {code:"LGW",city:"London",name:"Gatwick",country:"United Kingdom"},
  {code:"MAN",city:"Manchester",name:"Manchester Airport",country:"United Kingdom"},
  {code:"DXB",city:"Dubai",name:"Dubai International",country:"United Arab Emirates"},
  {code:"AUH",city:"Abu Dhabi",name:"Zayed International",country:"United Arab Emirates"},
  {code:"ACC",city:"Accra",name:"Kotoka International",country:"Ghana"},
  {code:"JNB",city:"Johannesburg",name:"O. R. Tambo International",country:"South Africa"},
  {code:"CPT",city:"Cape Town",name:"Cape Town International",country:"South Africa"},
  {code:"NBO",city:"Nairobi",name:"Jomo Kenyatta International",country:"Kenya"},
  {code:"ADD",city:"Addis Ababa",name:"Bole International",country:"Ethiopia"},
  {code:"DOH",city:"Doha",name:"Hamad International",country:"Qatar"},
  {code:"IST",city:"Istanbul",name:"Istanbul Airport",country:"Türkiye"},
  {code:"CDG",city:"Paris",name:"Charles de Gaulle",country:"France"},
  {code:"AMS",city:"Amsterdam",name:"Schiphol",country:"Netherlands"},
  {code:"FRA",city:"Frankfurt",name:"Frankfurt Airport",country:"Germany"},
  {code:"JFK",city:"New York",name:"John F. Kennedy International",country:"United States"},
  {code:"EWR",city:"New York",name:"Newark Liberty International",country:"United States"},
  {code:"ATL",city:"Atlanta",name:"Hartsfield–Jackson International",country:"United States"},
  {code:"YYZ",city:"Toronto",name:"Toronto Pearson International",country:"Canada"},
  {code:"YVR",city:"Vancouver",name:"Vancouver International",country:"Canada"},
  {code:"CAI",city:"Cairo",name:"Cairo International",country:"Egypt"},
  {code:"RUH",city:"Riyadh",name:"King Khalid International",country:"Saudi Arabia"},
  {code:"JED",city:"Jeddah",name:"King Abdulaziz International",country:"Saudi Arabia"},
  {code:"SIN",city:"Singapore",name:"Changi",country:"Singapore"},
  {code:"BKK",city:"Bangkok",name:"Suvarnabhumi",country:"Thailand"},
  {code:"KUL",city:"Kuala Lumpur",name:"Kuala Lumpur International",country:"Malaysia"},
  {code:"DEL",city:"New Delhi",name:"Indira Gandhi International",country:"India"},
];
export const airportLabel = (value: string) => airports.find(a=>a.code===value)?.city || value;
export function airportCode(value: string) {
  const match=value.match(/\(([A-Z]{3})\)$/);
  return match?.[1] || airports.find(a=>a.code===value.toUpperCase())?.code || "";
}
