import Tenancy from "../models/tenancy.model";
import Property from "../models/property.model";
import { getActiveTenancyFilter } from "./tenancy.utils";

export const computePropertyStatus = async (
  propertyId: string,
  session?: any
): Promise<string> => {
  const property = await Property.findById(propertyId).session(session);

  if (!property) {
    throw new Error("Property not found");
  }

  if (property.type === "SALE") {
    if (property.status === "SOLD") return "SOLD";
    return "AVAILABLE";
  }

  const activeTenants = await Tenancy.countDocuments({
    property: propertyId,
    ...getActiveTenancyFilter(),
  }).session(session);

  if (activeTenants === 0) return "AVAILABLE";

  if (activeTenants < property.maxTenants) {
    return "PARTIALLY_OCCUPIED"; 
  }

  return "RENTED";
};