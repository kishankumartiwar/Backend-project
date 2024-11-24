import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {user} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    // Validate tweet content
    if (!content || content.trim().length === 0) {
        res.status(400);
        throw new ApiError(401,"Tweet content cannot be empty.");
    }

    // Create a new tweet in the database
    const tweet = await Tweet.create({
        content,
        user: req.User._id, // Assuming `req.User` is populated by authentication middleware
    });

    if (tweet) {
        res.status(201).json(
           new ApiResponse(200,"Tweet created succesfully")
        );
    } else {
        throw new ApiError(404,"Failed to create the tweet.");
    }
});


const getUserTweets = asyncHandler(async (req, res) => {
    // Extract the userId from request params
    const userId = req.params.userId;

    // Check if the userId is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json(new ApiResponse(400, null, "Invalid userId"));
    }
    console.log(userId)
    // Query the Tweet model to find tweets by the authenticated user
    const userTweets = await Tweet.find({ user: userId });
    console.log(userTweets)

    // Handle case where no tweets are found
    if (!userTweets || userTweets.length === 0) {
        return res.status(404).json(new ApiResponse(200, "No tweets from user"));
    }

    // Return the list of tweets
    return res.status(200).json(
        new ApiResponse(200, userTweets, "Tweets fetched successfully")
    );
});



const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}