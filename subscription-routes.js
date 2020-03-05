


const comments = await Comments.findAll({ 
    order: [["createdAt", "DESC"]],
    where: { videoID: req.params.id }
});

//Sorting comments under video
router.get('/:id', asyncHandler(async (req, res) => {
}));


video = await Video.create({
    uploader: req.cookies.username,
    title: req.body.title,
    tags: req.body.tags,
    description: req.body.description,
    videoURL: req.body.videoURL,
    uploadDate: now.toISOString().slice(0, 10)
  });

