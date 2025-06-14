import { Router } from "express";
import asyncHandler from 'express-async-handler';
import { CommandeModel } from "../models/commande.model";
import { HTTP_NOT_FOUND } from "../constants/http_status";

const router = Router();

router.post("/", asyncHandler(
  async (req, res, next) => {
    try {
      const { list_marbles, totalPrice, location ,number_of_phone,order_name} = req.body;

      // Basic checks
      if (!list_marbles || !Array.isArray(list_marbles) || list_marbles.length === 0) {
        res.status(400).json({ success: false, message: 'list_marbles is required and must be a non-empty array' });
        return;
      }
      if (typeof totalPrice !== 'number') {
        res.status(400).json({ success: false, message: 'totalPrice must be a number' });
        return;
      }
      if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        res.status(400).json({ success: false, message: 'location with lat and lng is required' });
        return;
      }

      // Create the order
      const newCommande = await CommandeModel.create({
        list_marbles,
        totalPrice,
        location,
        number_of_phone,
        order_name
      });

      // Send success response
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: newCommande
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create order'
      });
    }
  }
));
router.get("/getAll", asyncHandler(
  async (req, res) => {
    try {
      const commandes = await CommandeModel.find();

      res.status(200).json({
        success: true,
        message: 'All commandes fetched successfully',
        data: commandes
      });
    } catch (error) {
      console.error('Error fetching commandes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch commandes'
      });
    }
  }
));
router.delete("/:commandeId", asyncHandler(
  async (req, res) => {
    const commandeId = req.params.commandeId;

    try {
      const deletedCommande = await CommandeModel.findByIdAndDelete(commandeId);
      if (!deletedCommande) {
        res.status(HTTP_NOT_FOUND).send('commande not found');
        return;
      }
      res.send(deletedCommande);
    } catch (error) {
      res.status(500).send({ error: 'An error occurred while processing the request.' });
    }
  }
));

export default router;