const foodModel = require('../models/food.model');
const storageService = require('../services/storage.service');
const likeModel = require("../models/likes.model")
const saveModel = require("../models/save.model")
const { v4: uuid } = require("uuid")


async function createFood(req, res) {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    const price = Number(req.body.price);

    if (!name || !Number.isFinite(price) || price <= 0 || !req.file) {
        return res.status(400).json({ message: 'A name, valid price, and video are required.' });
    }

    const fileUploadResult = await storageService.uploadFile(req.file.buffer, uuid())

    const foodItem = await foodModel.create({
        name,
        description,
        price: Math.round(price * 100) / 100,
        video: fileUploadResult.url,
        foodPartner: req.foodPartner._id
    })

    res.status(201).json({
        message: "food created successfully",
        food: foodItem
    })

}

async function getFoodItems(req, res) {
    const [foodItems, likes, saves] = await Promise.all([
        foodModel.find({}),
        likeModel.find({ user: req.user._id }).select('food'),
        saveModel.find({ user: req.user._id }).select('food')
    ]);

    res.status(200).json({
        message: "Food items fetched successfully",
        foodItems,
        likedFoodIds: likes.map((like) => String(like.food)),
        savedFoodIds: saves.map((save) => String(save.food))
    })
}

async function updateFood(req, res) {
    const { foodId } = req.params;
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    const price = Number(req.body.price);

    if (!name || !Number.isFinite(price) || price <= 0) {
        return res.status(400).json({ message: "A food name and valid price are required" });
    }

    const food = await foodModel.findOneAndUpdate(
        { _id: foodId, foodPartner: req.foodPartner._id },
        { name, description, price: Math.round(price * 100) / 100 },
        { new: true, runValidators: true }
    );

    if (!food) {
        return res.status(404).json({ message: "Food item not found" });
    }

    res.status(200).json({
        message: "Food updated successfully",
        food
    });
}

async function deleteFood(req, res) {
    const { foodId } = req.params;
    const food = await foodModel.findOneAndDelete({
        _id: foodId,
        foodPartner: req.foodPartner._id
    });

    if (!food) {
        return res.status(404).json({ message: "Food item not found" });
    }

    await Promise.all([
        likeModel.deleteMany({ food: foodId }),
        saveModel.deleteMany({ food: foodId })
    ]);

    res.status(200).json({ message: "Food deleted successfully" });
}


async function likeFood(req, res) {
    const { foodId } = req.body;
    const user = req.user;

    const isAlreadyLiked = await likeModel.findOne({
        user: user._id,
        food: foodId
    })

    if (isAlreadyLiked) {
        await likeModel.deleteOne({
            user: user._id,
            food: foodId
        })

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { likeCount: -1 }
        })

        return res.status(200).json({
            message: "Food unliked successfully"
        })
    }

    const like = await likeModel.create({
        user: user._id,
        food: foodId
    })

    await foodModel.findByIdAndUpdate(foodId, {
        $inc: { likeCount: 1 }
    })

    res.status(201).json({
        message: "Food liked successfully",
        like
    })

}

async function saveFood(req, res) {

    const { foodId } = req.body;
    const user = req.user;

    const isAlreadySaved = await saveModel.findOne({
        user: user._id,
        food: foodId
    })

    if (isAlreadySaved) {
        await saveModel.deleteOne({
            user: user._id,
            food: foodId
        })

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { savesCount: -1 }
        })

        return res.status(200).json({
            message: "Food unsaved successfully"
        })
    }

    const save = await saveModel.create({
        user: user._id,
        food: foodId
    })

    await foodModel.findByIdAndUpdate(foodId, {
        $inc: { savesCount: 1 }
    })

    res.status(201).json({
        message: "Food saved successfully",
        save
    })

}

async function getSaveFood(req, res) {

    const user = req.user;

    const savedFoods = await saveModel.find({ user: user._id }).populate('food');

    if (!savedFoods || savedFoods.length === 0) {
        return res.status(404).json({ message: "No saved foods found" });
    }

    res.status(200).json({
        message: "Saved foods retrieved successfully",
        savedFoods
    });

}


module.exports = {
    createFood,
    getFoodItems,
    updateFood,
    deleteFood,
    likeFood,
    saveFood,
    getSaveFood
}
