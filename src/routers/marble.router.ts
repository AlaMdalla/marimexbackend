import { Router } from "express";
import { sample_marble, sample_tags } from "../data";
import asynceHandler from  'express-async-handler';
import { MarbleModel } from "../models/marble.model";
import { HTTP_BAD_REQUEST } from "../constants/http_status";
import {  HTTP_NOT_FOUND } from "../constants/http_status";

const router=Router();


router.get("/seed",asynceHandler(
  async (req, res)=>{
    const marbleCount=await MarbleModel.countDocuments();
if(marbleCount>0){
  res.send("Seed is already done !");
  return;
}
await MarbleModel.create(sample_marble);
res.send("Seed Is Done !");
  }
  
  
))
router.get("/",asynceHandler(
  async(req, res)=>{
    const marbels=await MarbleModel.find();
      res.send(marbels);//sample_marble eli feha el data el kol
    }
))
router.get("/search/:searchTerm", async (req, res) => {
  const searchTerm = req.params.searchTerm;
  const searchRegex = new RegExp(searchTerm, 'i');

  try {
    const marbels = await MarbleModel.find({ name: searchRegex });
    res.send(marbels);
  } catch (error) {
    res.status(500).send({ error: 'An error occurred while processing the request.' });
  }
});


router.get("/tags",asynceHandler(
 
  async(req, res)=>{
    const tags = await MarbleModel.aggregate([
      {
        $unwind:'$tags'
      },
      {
        $group:{
          _id: '$tags',
          count: {$sum: 1}
        }
      },
      {
        $project:{
          _id: 0,
          name:'$_id',
          count: '$count'
        }
      }
    ]).sort({count: -1});
    const all={
      name:'All',
      count:await MarbleModel.countDocuments()
    }
    tags.unshift(all);
    
    res.send(tags);
}
))

router.get("/tags/:tagName",asynceHandler(
  async (req, res) => {
    const marbels = await MarbleModel.find({tags: req.params.tagName})
    res.send(marbels);
  }
))

router.get("/:marbleID",asynceHandler(
  async (req, res)=>{
    const marbel =await MarbleModel.findById(req.params.marbleID);
    res.send(marbel);
 }
))

router.post("/create", asynceHandler(
  async (req, res) => {
    const { name, price, tags, favorite, stars, imageurl, descriptions } = req.body;
    const user = await MarbleModel.findOne({ name });
    
    if (user) {
      res.status(HTTP_BAD_REQUEST)
      .send('Marble is already exists');
      return;
    }

    const newMarbel = {
    
      name,
      price,
      tags,
      favorite,
      stars,
      imageurl,
      descriptions
    };

    const dbMarble = await MarbleModel.create(newMarbel);
    res.status(201).json(dbMarble);
  }
));
router.delete("/:marbleID", asynceHandler(
  async (req, res) => {
    const marbleId = req.params.marbleID;

    try {
      const deletedMarble = await MarbleModel.findByIdAndDelete(marbleId);
      if (!deletedMarble) {
        res.status(HTTP_NOT_FOUND).send('Marble not found');
        return;
      }
      res.send(deletedMarble);
    } catch (error) {
      res.status(500).send({ error: 'An error occurred while processing the request.' });
    }
  }
));
router.delete("/:marbleID", asynceHandler(
  async (req, res) => {
    const marbleId = req.params.marbleID;

    try {
      const deletedMarble = await MarbleModel.findByIdAndDelete(marbleId);
      if (!deletedMarble) {
        res.status(HTTP_NOT_FOUND).send('Marble not found');
        return;
      }
      res.send(deletedMarble);
    } catch (error) {
      res.status(500).send({ error: 'An error occurred while processing the request.' });
    }
  }
));
router.put("/:marbleID", async (req, res) => {
  const marbleId = req.params.marbleID;
  const { name, price, tags, favorite, stars, imageurl, descriptions } = req.body;

  try {
    const updatedMarble = await MarbleModel.findByIdAndUpdate(
      marbleId,
      {
        name,
        price,
        tags,
        favorite,
        stars,
        imageurl,
        descriptions,
      },
      { new: true }
    );

    if (!updatedMarble) {
      res.status(HTTP_NOT_FOUND).send('Marble not found');
      return;
    }

    res.send(updatedMarble);
  } catch (error) {
    res.status(500).send({ error: 'An error occurred while processing the request.' });
  }
});


export default router;