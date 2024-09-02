const mongoose = require("mongoose");
const { Schema } = mongoose;

const BlogSchema = new Schema(
  {
    title: String,
    body: String,
    author:{
      type : Schema.Types.ObjectId,
      ref : "User"
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Blog", BlogSchema);
