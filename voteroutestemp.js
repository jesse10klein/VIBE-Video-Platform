

router.post('/', asyncHandler(async (req, res) => {

    //Check if user has voted on this video
    const vote = await videoVote.findOne({where: { videoID: req.params.id }});

    const video = await Video.findByPk(req.params.videoID);
    const newDownvoteCount = video.upvotes + 1;
    await video.update({ downvotes: newDownvoteCount });
    res.end();
  }));