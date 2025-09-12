// // utils/analyticsTracker.js
// import Analytics from "../models/analytics.js";

// // Track user activity
// export const trackActivity = async (userId, activityType, details = {}) => {
//   try {
//     const activity = new Analytics({
//       userId,
//       activityType,
//       details,
//       timestamp: new Date()
//     });
    
//     await activity.save();
//     return activity;
//   } catch (error) {
//     console.error("Error tracking activity:", error);
//   }
// };
// utils/analyticstracker.js
import Analytics from "../models/analytics.js";

/**
 * Track a user activity in the Analytics collection
 * @param {String} userId - ID of the user performing the action
 * @param {String} activityType - One of ["ai_chat","todo_update","whiteboard_edit","site_visit","document_edit"]
 * @param {Object} details - Additional info (todoId, status, message, etc.)
 */
export const trackActivity = async (userId, activityType, details = {}) => {
  try {
    await Analytics.create({
      userId,
      activityType,
      details,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Failed to track activity:", err.message);
  }
};

