import NodeGeocoder , {Options} from "node-geocoder";

const options = {
    provider : "mapquest",
    apiKey : process.env.MAPQUEST_API_KEY!,
    formatter : null
} satisfies Options;

const geocoder = NodeGeocoder(options);

export interface GeocodedResult{
    lat : number,
    lng : number ,
    formattedAddress : string
}

export const geocodeAddress = async (address : string) : Promise<GeocodedResult>=>{
    const res = await geocoder.geocode(address);

    if(!res || res.length === 0){
        throw new Error("Unable to Geocode address")
    }

    const geo = res[0];

    return {
        lat : geo.latitude!,
        lng : geo.longitude!,
        formattedAddress : geo.formattedAddress || address
    }
}