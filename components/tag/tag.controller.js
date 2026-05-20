import * as tagService from "./tag.service.js";

export const createTag = async (req, res) => {
  const tag = await tagService.createTag(req.body, req.user);
  res.status(201).json(tag);
};

export const getTags = async (req, res) => {
  const tags = await tagService.getTags(req.user);
  res.json(tags);
};

export const deleteTag = async (req, res) => {
  const tag = await tagService.deleteTag(req.params.id, req.user);
  res.json(tag);
};