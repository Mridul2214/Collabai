// import Analytics from "../models/analytics.js";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // ✅ Create or update analytics
// export const updateAnalytics = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { timeSpent, aiSearch, todoCompleted, todoPending } = req.body;

//     let analytics = await Analytics.findOne({ userId });

//     if (!analytics) {
//       analytics = new Analytics({ userId });
//     }

//     if (timeSpent) analytics.timeSpent += timeSpent;
//     if (aiSearch) analytics.aiSearches.push(aiSearch);
//     if (todoCompleted !== undefined) analytics.todos.completed = todoCompleted;
//     if (todoPending !== undefined) analytics.todos.pending = todoPending;

//     analytics.lastUpdated = Date.now();
//     await analytics.save();

//     res.json({
//       success: true,
//       analytics: {
//         timeSpent: analytics.timeSpent,
//         aiSearches: analytics.aiSearches,
//         todos: analytics.todos,
//         lastUpdated: analytics.lastUpdated
//       }
//     });
//   } catch (err) {
//     console.error("Update analytics error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// // 📊 Get analytics
// export const getAnalytics = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const analytics = await Analytics.findOne({ userId });

//     if (!analytics) {
//       return res.status(200).json({ 
//         timeSpent: 0,
//         aiSearches: [],
//         todos: { completed: 0, pending: 0 },
//         message: "No analytics data found. Start using the app to generate data."
//       });
//     }
    
//     res.json({
//       timeSpent: analytics.timeSpent,
//       aiSearches: analytics.aiSearches,
//       todos: analytics.todos,
//       lastUpdated: analytics.lastUpdated
//     });
//   } catch (err) {
//     console.error("Get analytics error:", err);
//     res.status(500).json({ error: "Failed to fetch analytics data" });
//   }
// };

// // 🤖 AI insights
// export const getAIInsights = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const analytics = await Analytics.findOne({ userId });

//     if (!analytics || !analytics.timeSpent) {
//       return res.json({ 
//         insights: "Not enough data yet to generate insights. Continue using the app to see personalized recommendations." 
//       });
//     }

//     const prompt = `
//     Analyze this user's activity and provide concise, helpful insights:
//     - Time spent on platform: ${analytics.timeSpent} minutes
//     - AI searches: ${analytics.aiSearches.join(", ") || "None yet"}
//     - Todos completed: ${analytics.todos.completed}
//     - Todos pending: ${analytics.todos.pending}

//     Provide 2-3 brief insights about:
//     1. Their productivity patterns
//     2. Interests based on search topics
//     3. One suggestion for improvement

//     Keep it friendly and actionable, under 150 words.
//     `;

//     const model = genAI.getGenerativeModel({ model: "gemini-pro" });
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
    
//     res.json({ insights: response.text() });
//   } catch (err) {
//     console.error("AI insights error:", err);
//     res.json({ 
//       insights: "Unable to generate AI insights at the moment. Please try again later." 
//     });
//   }
// };