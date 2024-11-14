import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema (
  {
    videoFile:{
      type:String,// using cloudinary service to get avatar
      required:true,
    },
    thumbnail:{
      type:String,// using cloudinary service to get avatar
      required:true,
    },
    title:{
      type:String,
      required:true,
    },
    description:{
      type:String,
      required:true,
    },
    duration:{
      type:Number, //cloudnary info (duration of video)
      required:true,
    },
    views:{
      type:Number,
      default:0,
    },
    isPublished:{
      type:Boolean,
      default:true,
    },
    owner:{
      type:Schema.Types.ObjectId,
      ref:"User"
    }
  },
  {
    timestamps:true
  }
)
videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("video",videoSchema);