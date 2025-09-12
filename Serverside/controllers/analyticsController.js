// controllers/analyticsController.js
import Analytics from "../models/analytics.js";
import AiChat from "../models/aichat.js";
import Document from "../models/document.js";
import Todo from "../models/Todo.js";
import Whiteboard from "../models/board.js";

// Track user activity
export const trackActivity = async (userId, activityType, details = {}) => {
  try {
    const activity = new Analytics({
      userId,
      activityType,
      details,
      timestamp: new Date()
    });
    
    await activity.save();
    return activity;
  } catch (error) {
    console.error("Error tracking activity:", error);
  }
};

// Get analytics data for dashboard
// export const getAnalytics = async (req, res) => {
//   try {
//     const { timeRange = "week", userId } = req.query;
//     const targetUserId = userId || req.user._id;
    
//     // Calculate date range
//     const now = new Date();
//     let startDate;
    
//     switch (timeRange) {
//       case "day":
//         startDate = new Date(now.setDate(now.getDate() - 1));
//         break;
//       case "week":
//         startDate = new Date(now.setDate(now.getDate() - 7));
//         break;
//       case "month":
//         startDate = new Date(now.setMonth(now.getMonth() - 1));
//         break;
//       case "quarter":
//         startDate = new Date(now.setMonth(now.getMonth() - 3));
//         break;
//       default:
//         startDate = new Date(now.setDate(now.getDate() - 7));
//     }
    
//     // Get activities in time range
//     const activities = await Analytics.find({
//       userId: targetUserId,
//       timestamp: { $gte: startDate }
//     }).sort({ timestamp: 1 });
    
//     // Process data for charts
//     const siteVisits = await processSiteVisits(activities, startDate);
//     const aiBotUsage = await processAiBotUsage(activities, startDate);
//     const todoStatus = await processTodoStatus(targetUserId);
//     const whiteboardUsage = await processWhiteboardUsage(activities, startDate);
    
//     res.json({
//       siteVisits,
//       aiBotUsage,
//       todoStatus,
//       whiteboardUsage
//     });
//   } catch (error) {
//     console.error("Error getting analytics:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// controllers/analyticsController.js

export const getAnalytics = async (req, res) => {
  try {
    // fetch activities only for the logged-in user
    const analytics = await Analytics.find({ userId: req.user._id }).sort({ timestamp: -1 });

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch analytics", error });
  }
};

// Process site visits data
const processSiteVisits = async (activities, startDate) => {
  // Group activities by day
  const days = [];
  const dayCounts = {};
  
  // Initialize days array
  const currentDate = new Date(startDate);
  const today = new Date();
  
  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split('T')[0];
    days.push(dateStr);
    dayCounts[dateStr] = 0;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Count activities per day
  activities.forEach(activity => {
    const dateStr = activity.timestamp.toISOString().split('T')[0];
    if (dayCounts[dateStr] !== undefined) {
      dayCounts[dateStr]++;
    }
  });
  
  // Format for chart
  const labels = days.map(day => {
    const date = new Date(day);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  });
  
  const data = days.map(day => dayCounts[day]);
  
  return { labels, data };
};

// Process AI bot usage
const processAiBotUsage = async (activities, startDate) => {
  const aiActivities = activities.filter(a => a.activityType === "ai_chat");
  
  // Group by day
  const days = [];
  const dayCounts = {};
  
  const currentDate = new Date(startDate);
  const today = new Date();
  
  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split('T')[0];
    days.push(dateStr);
    dayCounts[dateStr] = 0;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Count AI interactions per day
  aiActivities.forEach(activity => {
    const dateStr = activity.timestamp.toISOString().split('T')[0];
    if (dayCounts[dateStr] !== undefined) {
      dayCounts[dateStr]++;
    }
  });
  
  // Format for chart
  const labels = days.map(day => {
    const date = new Date(day);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  });
  
  const data = days.map(day => dayCounts[day]);
  
  return { labels, data };
};

// Process todo status
const processTodoStatus = async (userId) => {
  const todos = await Todo.find({ userId });
  
  const statusCounts = {
    todo: 0,
    inprogress: 0,
    done: 0
  };
  
  todos.forEach(todo => {
    statusCounts[todo.status]++;
  });
  
  return statusCounts;
};

// Process whiteboard usage
const processWhiteboardUsage = async (activities, startDate) => {
  const whiteboardActivities = activities.filter(a => a.activityType === "whiteboard_edit");
  
  // Group by day
  const days = [];
  const dayCounts = {};
  
  const currentDate = new Date(startDate);
  const today = new Date();
  
  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split('T')[0];
    days.push(dateStr);
    dayCounts[dateStr] = 0;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Count whiteboard activities per day
  whiteboardActivities.forEach(activity => {
    const dateStr = activity.timestamp.toISOString().split('T')[0];
    if (dayCounts[dateStr] !== undefined) {
      dayCounts[dateStr]++;
    }
  });
  
  // Format for chart
  const labels = days.map(day => {
    const date = new Date(day);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  });
  
  const data = days.map(day => dayCounts[day]);
  
  return { labels, data };
};


// Store events in DB or log them
export const trackAnalytics = async (req, res) => {
  try {
    const { type, todoId, newTitle, todoCompleted, todoPending } = req.body;

    // For now, just log to console (later you can store in MongoDB)
    console.log("Analytics event:", {
      user: req.user.id,
      type,
      todoId,
      newTitle,
      todoCompleted,
      todoPending,
    });

    res.status(201).json({ message: "Analytics tracked" });
  } catch (error) {
    console.error("Error tracking analytics:", error);
    res.status(500).json({ message: "Failed to track analytics" });
  }
};
