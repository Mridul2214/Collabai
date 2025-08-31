import mongoose from "mongoose";

const todoSchema = new mongoose.Schema({
    title:{type:String, required:true},
    status:{type:String,enum:["todo","inprogress","done"],default:"todo"},
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"user",required:true},
    dueDate:{type:Date},

},{timestamps:true});

export default mongoose.model("Todo",todoSchema);