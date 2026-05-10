import { CreatePropertyDTO , UpdatePropertyDTO} from "../../dto/property";

export const mapToCreatePropertyDTO = (body: any): CreatePropertyDTO => ({
  title: body.title,
  description: body.description,
  price: Number(body.price),
  type: body.type,
  address: {
    street: body.address.street,
    city: body.address.city,
    state: body.address.state,
    country: body.address.country,
  },
  bedrooms: body.bedrooms ? Number(body.bedrooms) : undefined,
  bathrooms: body.bathrooms ? Number(body.bathrooms) : undefined,
  area: body.area ? Number(body.area) : undefined,
});


export const mapToUpdatePropertyDTO = (body: any) => {
  const dto: UpdatePropertyDTO = {};

  if(body.title !== undefined) dto.title = body.title;
  if(body.description !== undefined) dto.description = body.description;
  if(body.price !== undefined) dto.price = Number(body.price);
  if(body.currency !== undefined) dto.currency = body.currency;
  if(body.type !== undefined) dto.type = body.type;
  if(body.address !== undefined) {
    dto.address = {
      street: body.address.street,
      city: body.address.city,
      state: body.address.state,
      country: body.address.country,
    }
  }
  if(body.bedrooms !== undefined) dto.bedrooms = Number(body.bedrooms);
  if(body.bathrooms !== undefined) dto.bathrooms = Number(body.bathrooms);
  if(body.area !== undefined) dto.area = Number(body.area);

  return dto;
}