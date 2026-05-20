import Tag from "./tag.model.js";
import ApiError from "../../utils/ApiError.js";

export const createTag = async (data, user) => {
  const { name } = data;

  if (!name) {
    throw new ApiError(400, "Tag name is required");
  }

  const slug = name.toLowerCase().replace(/\s+/g, "-");

  const existing = await Tag.findOne({
    slug,
    hostelNumber: user.hostelNumber,
  });

  if (existing) {
    throw new ApiError(400, "Tag already exists");
  }

  return await Tag.create({
    name,
    slug,
    hostelNumber: user.hostelNumber,
  });
};

export const getTags = async (user) => {
  return Tag.find({
    hostelNumber: user.hostelNumber,
    isActive: true,
  });
};

export const deleteTag = async (tagId, user) => {
  const tag = await Tag.findById(tagId);

  if (!tag) throw new ApiError(404, "Tag not found");

  if (tag.hostelNumber !== user.hostelNumber) {
    throw new ApiError(403, "Unauthorized");
  }

  tag.isActive = false;
  await tag.save();

  return tag;
};