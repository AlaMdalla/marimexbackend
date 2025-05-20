import { MarbleModel } from "../models/marble.model";
import { sample_marble } from "../data";
import cloudinary from '../configs/cloudinary';
import { IMarble, IMarbleTag, CloudinaryResult } from '../types/marble.types';

export const marbleService = {
  seedMarbles: async (): Promise<string> => {
    const marbleCount = await MarbleModel.countDocuments();
    if (marbleCount > 0) {
      return "Seed is already done!";
    }
    await MarbleModel.create(sample_marble);
    return "Seed Is Done!";
  },

  getAllMarbles: async (): Promise<IMarble[]> => {
    return await MarbleModel.find();
  },

  searchMarbles: async (searchTerm: string): Promise<IMarble[]> => {
    const searchRegex = new RegExp(searchTerm, 'i');
    return await MarbleModel.find({ name: searchRegex });
  },

  getMarbleTags: async (): Promise<IMarbleTag[]> => {
    const tags = await MarbleModel.aggregate([
      {
        $unwind: '$tags'
      },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: '$count'
        }
      }
    ]).sort({ count: -1 });
    
    const all = {
      name: 'All',
      count: await MarbleModel.countDocuments()
    };
    tags.unshift(all);
    
    return tags;
  },

  getMarblesByTag: async (tagName: string): Promise<IMarble[]> => {
    return await MarbleModel.find({ tags: tagName });
  },

  getMarbleById: async (id: string): Promise<IMarble | null> => {
    return await MarbleModel.findById(id);
  },

  findMarbleByName: async (name: string): Promise<IMarble | null> => {
    return await MarbleModel.findOne({ name });
  },

  createMarble: async (marbleData: IMarble): Promise<IMarble> => {
    const newMarble: IMarble = {
      name: marbleData.name,
      price: marbleData.price,
      tags: marbleData.tags,
      favorite: marbleData.favorite,
      stars: marbleData.stars,
      imageurl: marbleData.imageurl,
      descriptions: marbleData.descriptions
    };
    
    return await MarbleModel.create(newMarble);
  },

  deleteMarble: async (id: string): Promise<IMarble | null> => {
    return await MarbleModel.findByIdAndDelete(id);
  },

  updateMarble: async (id: string, marbleData: IMarble): Promise<IMarble | null> => {
    return await MarbleModel.findByIdAndUpdate(
      id,
      {
        name: marbleData.name,
        price: marbleData.price,
        tags: marbleData.tags,
        favorite: marbleData.favorite,
        stars: marbleData.stars,
        imageurl: marbleData.imageurl,
        descriptions: marbleData.descriptions,
      },
      { new: true }
    );
  },

  uploadToCloudinary: async (filePath: string): Promise<CloudinaryResult> => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(filePath, (err: any, result: CloudinaryResult) => {
        if (err) reject(err);
        resolve(result);
      });
    });
  }
};