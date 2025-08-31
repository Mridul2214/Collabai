// import mongoose from "mongoose";

// const analyticsSchema = new mongoose.Schema({
//   userId: { 
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: "User", 
//     required: true,
//     unique: true 
//   },
//   timeSpent: { 
//     type: Number, 
//     default: 0 
//   }, // in minutes
//   aiSearches: [{ 
//     type: String 
//   }], // queries asked in AI chat
//   todos: {
//     completed: { 
//       type: Number, 
//       default: 0 
//     },
//     pending: { 
//       type: Number, 
//       default: 0 
//     }
//   },
//   lastUpdated: { 
//     type: Date, 
//     default: Date.now 
//   }
// });

// // Create index for faster queries
// analyticsSchema.index({ userId: 1 });

// export default mongoose.model("Analytics", analyticsSchema);