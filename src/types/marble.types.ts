export interface IMarble {
  _id?: string;
  name: string;
  price: number;
  tags: string[];
  favorite: boolean;
  stars: number;
  imageurl: string;
  descriptions: string;
}

export interface IMarbleTag {
  name: string;
  count: number;
}

export interface CloudinaryResult {
  public_id: string;
  url: string;
  secure_url: string;
  // Add other properties you need from Cloudinary response
}