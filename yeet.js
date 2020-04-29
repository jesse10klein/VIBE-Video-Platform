



function scoreVideo(searchTerm, video) {

  //Score using tags, uploader name, slight subscriber and view weight
  const tags = video.tags.split("`");
  if (tags[tags.length - 1] == "") {
    tags.pop(tags.length - 1);
  }

  const tagMatch = 0;
  const additionalMatches = 0;

  const terms = searchTerm.split(" ");
  for (word in terms) {
    for (tag in tags) {
      if (word == tag) {
        if (tagMatch) {
          additionalMatches += 100;
        } else {
          tagMatch = 1000;
        }
      }
    }
  }

  const viewRating = (video.viewCount / 1000);
  const likeRating = (video.upvotes / 100); 

  const rating = tagMatch + additionalMatches + viewRating + likeRating;
  return rating;
}