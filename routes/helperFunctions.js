const validator = require("email-validator");
const path = require('path');

const db = require(path.join(__dirname, '../db'));
const { Video } = db.models;
const { UserInfo } = db.models;
const { Comments } = db.models;
const { videoVotes } = db.models;
const { commentVotes } = db.models;
const { Bookmarks } = db.models;
const { Subscriptions} = db.models;
const { passwordVerify } = db.models;
const { Message } = db.models;
const { WatchParty} = db.models;

const Op = require('sequelize').Op;

function asyncHandler(cb) {
    return async(req, res, next) => {
      try {
        await cb(req, res, next);
      } catch(error) {
        console.log(error.message);
        res.status(500).send(error.message);
      }
    }
}

function formatDay(day) {
    const ones = day % 10;
    let formatted = "" + day;
    switch (ones) {
        case 1:
            formatted += 'st';
            break;
        case 2: 
            formatted += 'nd';
            break;
        case 3:
            formatted += 'rd';
            break;
        default:
            formatted += 'th';
            break;
    }
    return formatted;
}
  
function parseTags(tagString) {
  const tags = tagString.split("`");
  if (tags[tags.length - 1] == "") {
    tags.pop(tags.length - 1);
  }
  return tags;
}

async function formatVideo(video) {

  const user = await UserInfo.findOne({where: { username: video.uploader }});
  video.imageURL = user.imageURL;
  video.formattedViewCount = formatViews(video.viewCount);
  video.timeSince = formatTimeSince(video.createdAt);
  video.likePercentage = Math.ceil(video.upvotes / (video.upvotes + video.downvotes)) * 100;
  if (video.upvotes == 0 && video.downvotes == 0) {
    video.likePercentage = 100;
  }
  return video;
}

function formatDate(entry) {

  const date = entry.toString().slice(4, 13);

  let formattedDate = "";
  var contents = date.split(' ');
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  finalMonth = null;
  for (month of months) {
    if (month.startsWith(contents[0])) {
      finalMonth = month;
      break;
    }
  }

  const day = formatDay(parseInt(contents[1]));
  const year = "20" + contents[2];
  formattedDate += day + " " + finalMonth + " " + year;
  return formattedDate;
}

function formatTimeSince(commentDate) {

  const date = Date.parse(commentDate);
  const now = Date.now();
  const sinceUpload = now - date;

  let timePassed = "Error not set";

  const days = Math.floor(sinceUpload / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365)
  const hours = Math.floor(sinceUpload / (1000 * 60 * 60));
  const minutes =  Math.floor(sinceUpload / (1000 * 60));


  if (years >= 1) {
    if (years == 1) timePassed = "1 year ago";
    else timePassed = years + " years ago";
  } else if (months >= 1) {
    if (months == 1) timePassed = "1 month ago";
    else timePassed = months + " months ago";
  } else if (days >= 1) {
    if (days == 1) timePassed = "1 day ago";
    else timePassed = days + " days ago";
  } else if (hours > 0) {
    if (hours == 1) timePassed = "1 hour ago";
    else timePassed = hours + " hours ago";
  } else {
    if (minutes < 3) timePassed = "Just now";
    else timePassed = minutes + " minutes ago";
  } 
  return timePassed;
}

function formatTitle(title) {
  if (title.length > 45) {
    return title.slice(0, 45) + "...";
  } else {
    return title;
  }
}

function formatViews(views) {
  //Just gonna go ahead and assume a video won't get a billion views

  if (views < 1000) {
    return views;
  } else if (views < 1000000) {
    return Math.floor(views / 1000) + "K";
  } else {
    return Math.floor(views / 1000000) + "M";
  }
}

function checkUploadData(title, description, tags) {

  let errors = [];

  if (title.length < 5) {
    errors.push(1);
  }

  if (description.length < 5) {
    errors.push(2);
  }

  if (tags.length < 20) {
    errors.push(3);
  }

  return errors;
}

function checkForErrors(potentialErrors) {
  let error = {};
  if (potentialErrors.includes(1)) {
    error.title = "Title must be at least 5 characters long";
  } 
  if (potentialErrors.includes(2)) {
    error.description = "Description must be at least 5 characters long";
  } 
  if (potentialErrors.includes(3)) {
    error.tags = "You need to add more tags";
  }
  return error;
}

async function signupErrors(username, email, password, verifyPassword) {

  let error = {};
  //Check for null
  if (email == null || email.length <= 5) {
    error.email = "Email must be longer than 5 characters";
  } 
  if (username == null || username.length <= 5) {
    error.username = "Username must be longer than 5 characters";
  } 
  if (password == null || password.length <= 5) {
    error.password = "Password must be longer than 5 characters";
  } 
  
  if (password != verifyPassword) {
    error.passwordDup = "The two entered passwords don't match";
  }

  //Check for valid email
  if (!validator.validate(email)) {
    error.email = "Your email is invalid";
  }    

  //Make sure that username and email aren't taken
  const usernameMatch = await UserInfo.findOne({ where: { username }});
  if (usernameMatch != null) {
    error.username = "That username is already in the system";
  }

  const emailMatch = await UserInfo.findOne({ where: { email }});
  if (emailMatch != null) {
    error.email = "That email is already in the system";
  }
  return error;

}

async function getRepliesForComment(comment, username, type) {
    
  const convertedReplies = [];

  //Get replies to this comment
  let replies;
  if (type == "new") {
    replies = await Comments.findAll({
      order: [["createdAt", "ASC"]],
      where: {replyID: comment.id}
    });
  } else {
    replies = await Comments.findAll({
      order: [["commentLikes", "DESC"]],
      where: {replyID: comment.id}
    });
  }

  for (reply of replies) {

    //For each reply, get user for image url
    const user = await UserInfo.findOne({where: {username: reply.user}});

    const formComment = {
      id : reply.id,
      user: reply.user,
      videoID: reply.videoID,
      comment: reply.comment,
      replyID: reply.replyID,
      commentLikes: reply.commentLikes,
      commentDislikes: reply.commentDislikes,
      edited: reply.edited,
      imageURL: user.imageURL, 
      byUser: reply.user == username,
      formattedDate: formatTimeSince(reply.createdAt)
    }
    convertedReplies.push(formComment);
  }
  return convertedReplies;
}

async function getCommentsForVideo(videoID, username, type) {

  let comments;
  if (type == "new") {
    comments = await Comments.findAll({ 
      order: [["createdAt", "DESC"]], where: {videoID, replyID: -1}
    });
  } else {
    comments = await Comments.findAll({ 
      order: [["commentLikes", "DESC"]], where: {videoID, replyID: -1}
    });
  }

  //Need to format date for comments
  for (let i = 0; i < comments.length; i++) {

    //If current user made this comment, add thingo
    if (comments[i].user == username) {
      comments[i].byUser = true;
    }

    //get number of replies for each comment
    const replies = await Comments.findAll({where: {replyID: comments[i].id}});
    comments[i].numReplies = replies.length;

    comments[i].formattedDate = formatTimeSince(comments[i].createdAt);
    //For each comment, get user for image url
    const user = await UserInfo.findOne({where: {username: comments[i].user}});
    comments[i].imageURL = user.imageURL;
  }
  
  return comments;
}

async function deleteComments(comments) {

  for (let i = 0; i < comments.length; i++) {

    //Get all votes related to the comment
    const commentID = comments[i].id
    const votes = await commentVotes.findAll({where: {commentID}});

    //Delete votes
    for (let y = 0; y < votes.length; y++) {
      await votes[y].destroy();
    }
    
    //Delete comment
    await comments[i].destroy();
  }

}

async function deleteVideo(video) {

  //Get all votes associated with video
  const videoID = video.id;
  const vidVotes = await videoVotes.findAll({where: {videoID}})

  //Delete votes
  for (let i = 0; i < vidVotes.length; i++) {
    await vidVotes[i].destroy();
  }

  //Get all comments associated with video
  const comments = await Comments.findAll({where: {videoID}});
  await deleteComments(comments);

  const bookmarks = Bookmarks.findAll({where: {videoID}});
  await bookmarks.destory();

  await video.destroy();
  return;

}

async function deleteAccount(user) {

  const username = user.username;

  const videos = await Video.findAll({where: {uploader: username}});
  //Destroy all of the comments on each video
  for (let i = 0; i < videos.length; i++) {
      const comments = await Comments.findAll({where: {videoID: videos[i].id}});
      for (let i = 0; i < comments.length; i++) {
        await comments[i].destroy();
      }
  }
  //Destroy all videos
  for (let i = 0; i < videos.length; i++) {
    await videos[i].destroy();
  }

  //Now delete all comments made by user
  const comments = await Comments.findAll({where: {user: username}});
  for (let i = 0; i < comments.length; i++) {
    await comments[i].destroy();
  }

  //Now delete all subscriptions
  const subscriptions = await Subscriptions.findAll({
      where: {
          [Op.or]: {
              user: username,
              subscriber: username
          }
      }
  });
  
  for (let i = 0; i < subscriptions.length; i++) {
    await subscriptions[i].destroy();
  }

  //Delete all bookmarks made by user
  const bookmarks = await Bookmarks.findAll({where: {username}});
  for (let i = 0; i < bookmarks.length; i++) {
    await bookmarks[i].destroy();
  }


  //Delete all video votes and comment votes
  const vidVotes = await videoVotes.findAll({where: {user: username}});
  for (let i = 0; i < vidVotes.length; i++) {
    await vidVotes[i].destroy();
  }
  
  const comVotes = await commentVotes.findAll({where: {user: username}});
  for (let i = 0; i < comVotes.length; i++) {
    await comVotes[i].destroy();
  }
  await user.destroy();

}

async function convertCommentsAjax(comments, username) {

  const formattedComments = []

  for (comment of comments) {
    
    //Need to get number of replies
    const replies = await Comments.findAll({where: {replyID: comment.id}});
 
    const byUser = (comment.user == username);

    const formComment = {
      id : comment.id,
      user: comment.user,
      videoID: comment.videoID,
      comment: comment.comment,
      replyID: comment.replyID,
      commentLikes: comment.commentLikes,
      commentDislikes: comment.commentDislikes,
      edited: comment.edited,
      imageURL: comment.imageURL, 
      numReplies: replies.length,
      byUser,
      formattedDate: formatTimeSince(comment.createdAt)
    }
    formattedComments.push(formComment);
  }
  return formattedComments;

}

function convertVideosAjax(videos) {

  const formattedVideos = [];
  for (video of videos) {

    const formattedVideo = {
      id : video.id,
      uploader: video.uploader,
      title: video.title,
      videoURL: video.videoURL,
      uploadDate: formatTimeSince(video.createdAt),
      viewCount: formatViews(video.viewCount)
    }
    formattedVideos.push(formattedVideo);
  }
  return formattedVideos
}

function timeSince(commentDate) {

  const sinceUpload = Date.now() - Date.parse(commentDate);
  const days = Math.floor(sinceUpload / (1000 * 60 * 60 * 24));

  if (Math.ceil(days) <= 7) {
    return 0;
  }
  if (Math.ceil(days) <= 31) {
    return 1;
  }
  return 2;
}

async function getSubVideos(username) {

  const subscriptions = await Subscriptions.findAll({where: {subscriber: username}});

  let subVideos = [];

  for (let i = 0; i < subscriptions.length; i++) {
      //Get uploader
      const uploader = await UserInfo.findOne({where: {username: subscriptions[i].user}});

      if (uploader == null) {
          console.log("ERROR IN SUBS VIDS SECTION")
          res.send("Error in subs woops");
          return;
      }

      //Get any videos that user has uploaded in the past 90 days
      const now = new Date()
      now.setMonth(now.getMonth - 1);

      const videos = await Video.findAll({where: {
        uploader: uploader.username,
        createdAt: {
          [Op.lt]: new Date(),
          [Op.gt]: new Date(new Date() - 3 * 30 * 24 * 60 * 60 * 1000)
        }
      }});

      for (let i = 0; i < videos.length; i++) {
          videos[i] = await formatVideo(videos[i]);
          subVideos.push(videos[i]);
      }
  }

  if (subVideos.length == 0) {
    return null;
  }

  //Sort list by date
  subVideos.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1);
  
  //Make object with list of videos and titles

  let thisWeek = [];
  let thisMonth = [];
  let thisSeason = [];

  for (let i = 0; i < subVideos.length; i++) {
    time = timeSince(subVideos[i].createdAt);
    if (time == 0) { //This week
      thisWeek.push(subVideos[i]);
    }
    if (time == 1) { //This month
      thisMonth.push(subVideos[i]);
    }
    if (time == 2) { //This season
      thisSeason.push(subVideos[i]);
    }
  }

  if (thisWeek.length == 0) {
    thisWeek = null;
  }
  if (thisMonth.length == 0) {
    thisMonth = null;
  }
  if (thisSeason.length == 0) {
    thisSeason = null;
  }

  finalSubVideos = [{
    title: "This Week",
    videos: thisWeek
  }, {
    title: "This Month",
    videos: thisMonth
  }, {
    title: "Past 90 days",
    videos: thisSeason
  }];
  return finalSubVideos;

}

async function generatePartyJoinString() {
  let randomString = "";
  const acceptable = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"

  for (let i = 0; i < 20; i++) {
    randomString += acceptable.charAt(Math.random() * (acceptable.length - 1));
  }

  //Make sure its not already used
  const match = await WatchParty.findOne({where: {joinLink: randomString}});
  if (match) {
    generateRandomString();
  } else {
    return randomString;
  }
}

async function generateRandomString() {

  let randomString = "";
  const acceptable = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"

  for (let i = 0; i < 20; i++) {
    randomString += acceptable.charAt(Math.random() * (acceptable.length - 1));
  }

  //Make sure its not already used
  const match = await passwordVerify.findOne({where: {verifyID: randomString}});
  if (match) {
    generateRandomString();
  } else {
    return randomString;
  }
}

function getMailOptions(user, link) {

  const mailOptions = {
    from: 'vibevideoservice@gmail.com',
    to: user.email,
    subject: `Password recovery request`,
    text: `Dear ${user.username}. \n\n
            You are recieving this email as you have recently requested that your password be reset. If you did not send this request please disregard this email and change your password on our website \n\n
            If you did send this request, please click the following link to reset your password: ${link}`
  }
  return mailOptions;
}

function getMailOptionsVerify(user, link) {
  const mailOptions = {
    from: 'vibevideoservice@gmail.com',
    to: user.email,
    subject: `Account Verification Request`,
    text: `Dear ${user.username}. \n\n
            You are recieving this email as you have recently requested to verify your account. If you did not send this request please disregard this email and change your password on our website \n\n
            If you wish to verify your account on Vibe Videos please click the following link: ${link}`
  }
  return mailOptions;
}

async function getSearchResults(searchTerm) {
  
  let videos = await Video.findAll();
  for (let i = 0; i < videos.length; i++) {
    videos[i].rating = scoreVideo(searchTerm, videos[i]);
    videos[i].video = true;
  }

  let users = await UserInfo.findAll();
  for (let i = 0; i < users.length; i++) {
    users[i].rating = scoreUser(searchTerm, users[i]);
  }

  //Add videos and users together
  let searchResults = [];

  users = users.filter( (user) => {return user.rating > 100});
  videos = videos.filter( (video) => {return video.rating > 100});

  //Format users and videos and add to search terms
  for (let i = 0; i < users.length; i++) {
    const object = {
      id: users[i].id,
      username: users[i].username,
      subscriberCount: users[i].subscriberCount,
      imageURL: users[i].imageURL,
      rating: users[i].rating,
      bannerURL: users[i].bannerURL,
      createdAt: users[i].createdAt
    }
    searchResults.push(object);
  }

  for (let i = 0; i < videos.length; i++) {
    const user = await UserInfo.findOne({where: {username: videos[i].uploader}});
    let likePercentage = Math.ceil(videos[i].upvotes / (videos[i].upvotes + videos[i].downvotes)) * 100;
    if (videos[i].upvotes == 0 && videos[i].downvotes == 0) {
      likePercentage = 100;
    }
    const object = {
      id: videos[i].id,
      uploader: videos[i].uploader,
      title: videos[i].title,
      videoURL: videos[i].videoURL,
      formattedViewCount: formatViews(videos[i].viewCount),
      rating: videos[i].rating,
      video: videos[i].video,
      imageURL: user.imageURL,
      likePercentage,
      timeSince: formatTimeSince(videos[i].createdAt),
      createdAt: videos[i].createdAt
    }
    searchResults.push(object);
  }
  if (searchResults.length == 0) {
    return null;
  }

  return searchResults;
}

function scoreUser(searchTerm, user) {

  let tags = video.tags.toLowerCase().split("`");
  if (tags[tags.length - 1] == "") {
    tags.pop(tags.length - 1);
  }

  let tagMatch = 0;
  let additionalMatches = 0;

  let terms = searchTerm.toLowerCase().split(" ");
  let titleTerms = user.username.toLowerCase().split(" ");
  for (word of terms) {
    for (tag of tags) {
      if (word.length < 3 || tag.length < 3) {
        continue;
      }
      if (word == tag || word.includes(tag) || tag.includes(word)) {
        if (tagMatch) {
          additionalMatches += 100;
        } else {
          tagMatch = 1000;
        }
      }
    }
    for (term of titleTerms) {
      if (word.length < 3 || term.length < 3) {
        continue;
      }
      if (word == term || word.includes(term) || term.includes(word)) {
        if (tagMatch) {
          additionalMatches += 100;
        } else {
          tagMatch = 1000;
        }
      }
    }
  }
  const subscriberRating = (user.subscriberCount / 100);

  const rating = tagMatch + additionalMatches + subscriberRating;
  return rating;
}

function scoreVideo(searchTerm, video) {

  //Score using tags, uploader name, slight subscriber and view weight
  let tags = video.tags.toLowerCase().split("`");
  if (tags[tags.length - 1] == "") {
    tags.pop(tags.length - 1);
  }

  let tagMatch = 0;
  let additionalMatches = 0;

  let terms = searchTerm.toLowerCase().split(" ");
  let titleTerms = video.title.toLowerCase().split(" ");
  for (word of terms) {
    for (tag of tags) {
      if (word.length < 3 || tag.length < 3) {
        continue;
      }
      if (word == tag || word.includes(tag) || tag.includes(word)) {
        if (tagMatch) {
          additionalMatches += 100;
        } else {
          tagMatch = 1000;
        }
      }
    }
    for (term of titleTerms) {
      if (word.length < 3 || term.length < 3) {
        continue;
      }
      if (word == term || word.includes(term) || term.includes(word)) {
        if (tagMatch) {
          additionalMatches += 100;
        } else {
          tagMatch = 1000;
        }
      }
    }
  }

  const viewRating = (video.viewCount / 1000000);
  const likeRating = (video.upvotes / 100000); 

  const rating = tagMatch + additionalMatches + viewRating + likeRating;
  return rating;
}

async function getRecentMessages(username) {

  //Get conversations with user, and the last message sent and time
  //Here need Op.or, sender or reciever
  let messages = await Message.findAll({
    order: [["createdAt", "DESC"]],
    where: {
      [Op.or]: {
        sender: username,
        recipient: username
      }
    }
  });

  let usersFilled = [];
  let recentMessages = [];

  for (let i = 0; i < messages.length; i++) {
    const user = messages[i].sender == username ? messages[i].recipient : messages[i].sender;
    if (usersFilled.includes(user)) {
      continue;
    }
    usersFilled.push(user);
    recentMessages.push(messages[i]);
  }

  //Time to format messages
  for (let i = 0; i < recentMessages.length; i++) {
    const user = recentMessages[i].sender == username ? recentMessages[i].recipient : recentMessages[i].sender;
    const userProfile = await UserInfo.findOne({where: {username: user}});
    recentMessages[i].imageURL = userProfile.imageURL;
    recentMessages[i].formattedTimeSince = formatTimeSince(recentMessages[i].createdAt);
    recentMessages[i].sentByUser = (username == recentMessages[i].sender);
    recentMessages[i].toUser = user;
    recentMessages[i].displayRead = recentMessages[i].sentByUser || recentMessages[i].read;
    if (recentMessages[i].message.length > 37) {
      recentMessages[i].message = recentMessages[i].message.slice(0, 34) + "...";
    }
  }

  //Only return 5 most recent messages
  if (recentMessages.length < 5) {
    recentMessages = recentMessages.slice(0, 5);
  }
  return recentMessages;

}

//This function provides a rating for a video purely based on its interactivity
async function videoStandardScore(video) {

  const viewScore = (video.viewCount / 10);
  const likeScore = (video.upvotes / 2);
  const comments = await Comments.findAll({where: {videoID: video.id}});
  const commentScore = (comments.length / 10);
  return viewScore + likeScore + commentScore;
}

async function getSidebarVideos(username) {

  //Get videos for sidebar: for now just any videos
  let videos = await Video.findAll({order: [["createdAt", "DESC"]]});

  if (username == null) {
    //FORMAT THESE VIDEOS (TITLE, VIEWS, UPLOAD)
    for (let i = 0; i < videos.length; i++) {
      videos[i].formattedTitle = formatTitle(videos[i].title);
      videos[i].formattedViews = formatViews(videos[i].viewCount);
      videos[i].formattedUploadDate = formatTimeSince(videos[i].createdAt);
    }
    return videos;
  }

  for (let i = 0; i < videos.length; i++) {
    const sub = await Subscriptions.findOne({where: {user: videos[i].uploader, subscriber: username}});
   
    videos[i].score = await (videoStandardScore(videos[i]));
    if (sub != null) {
      videos[i].score *= 1.5;
    }
  }

  videos.sort((a, b) => (a.score < b.score) ? 1 : -1);

  //FORMAT THESE VIDEOS (TITLE, VIEWS, UPLOAD)
  for (let i = 0; i < videos.length; i++) {
    videos[i].formattedTitle = formatTitle(videos[i].title);
    videos[i].formattedViews = formatViews(videos[i].viewCount);
    videos[i].formattedUploadDate = formatTimeSince(videos[i].createdAt);
  }

  return videos;
}

module.exports = {asyncHandler, formatDay, formatDate, formatTimeSince, formatTitle, 
  formatViews, checkUploadData, checkForErrors, signupErrors, getCommentsForVideo, 
  deleteComments, deleteVideo, deleteAccount, convertCommentsAjax,
  convertVideosAjax, getRepliesForComment, getSubVideos, formatVideo, getMailOptions,
  generateRandomString, parseTags, scoreVideo, getRecentMessages, getSidebarVideos, getSearchResults,
  getMailOptionsVerify, generatePartyJoinString};