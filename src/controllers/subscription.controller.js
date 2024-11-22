import mongoose, {isValidObjectId} from "mongoose"
import {user} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user.id; // Assumes you have user authentication middleware setting req.user

    // Check if the channel exists
    const channel = await Channel.findById(channelId);
    if (!channel) {
        res.status(404);
        throw new Error("Channel not found");
    }

    // Check if the user is already subscribed to the channel
    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const isSubscribed = user.subscriptions.includes(channelId);

    if (isSubscribed) {
        // Unsubscribe
        user.subscriptions = user.subscriptions.filter(id => id.toString() !== channelId);
        channel.subscribers = channel.subscribers.filter(id => id.toString() !== userId);
    } else {
        // Subscribe
        user.subscriptions.push(channelId);
        channel.subscribers.push(userId);
    }

    // Save changes
    await user.save();
    await channel.save();

    res.status(200).json({
        success: true,
        message: isSubscribed
            ? "Successfully unsubscribed from the channel"
            : "Successfully subscribed to the channel",
    });
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}