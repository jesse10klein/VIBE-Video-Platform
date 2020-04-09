const validator = require("email-validator");


const db = require('../db');
const { UserInfo } = db.models;
const { Comments } = db.models;
const { videoVotes } = db.models;
const { commentVotes } = db.models;


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
  
function formatDate(entry) {
    let formattedDate = "";
    var contents = entry.split('-');
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = months[parseInt(contents[1]) - 1];
    const day = formatDay(parseInt(contents[2]));
    const year = contents[0];
    formattedDate += day + " " + month + " " + year;
    return formattedDate;
}

function formatTimeSince(commentDate) {

  const date = Date.parse(commentDate);
  const now = Date.now();
  const sinceUpload = now - date;

  let timePassed = "NULL";

  const days = Math.floor(sinceUpload / (1000 * 60 * 60 * 24));
  const hours = Math.floor(sinceUpload / (1000 * 60 * 60));
  const minutes =  Math.floor(sinceUpload / (1000 * 60));

  if (days >= 1) {
    if (days == 1) timePassed = "Posted 1 day ago";
    else timePassed = days + " days ago";
  } else if (hours > 0) {
    if (hours == 1) timePassed = "1 hour ago";
    else timePassed = "Posted " + hours + " hours ago";
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
    return (views % 1000) + "K";
  } else {
    return (views % 1000000) + "M";
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

  if (tags.length < 5) {
    errors.push(3);
  }

  return errors;
}

function checkForErrors(potentialErrors, file) {
  let error = {};
  if (potentialErrors.includes(1)) {
    error.title = "Title must be at least 5 characters long";
  } 
  if (potentialErrors.includes(2)) {
    error.description = "Description must be at least 5 characters long";
  } 
  if (potentialErrors.includes(3)) {
    error.tags = "Tags must be at least 5 characters long";
  } 
  if (!file) {
    error.file = "You must select a file to upload";
  } else if (file.fileName.mimetype != "video/mp4") {
    error.file = "You must select an mp4 file";
  }
  return error;
}

async function signupErrors(username, email, password) {

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

async function getCommentsForVideo(videoID, username) {

  let comments = await Comments.findAll({ 
    order: [["createdAt", "DESC"]], where: {videoID, replyID: -1}});

  //Need to format date for comments
  for (let i = 0; i < comments.length; i++) {

    //If current user made this comment, add thingo
    if (comments[i].user == username) {
      comments[i].byUser = true;
    }


    comments[i].formattedDate = formatTimeSince(comments[i].createdAt);

    //Get replies to this comment
    let replies = await Comments.findAll({
      order: [["createdAt", "DESC"]],
      where: {replyID: comments[i].id}
    })

    //Format date
    for (let y = 0; y < replies.length; y++) {
       //If current user made this comment, add thingo
      if (replies[y].user == username) {
        replies[y].byUser = true;
      }
      replies[y].formattedDate = formatTimeSince(replies[y].createdAt);
    }

    //Set the replies on the comment
    comments[i].replies = replies;
  }
  return comments;
}

async function deleteComments(comments) {

  console.log("Delete comments function")

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

  console.log("Delete video function");

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

  console.log("NEED TO ADD IN DELETING BOOKMARED VIDEOS");

  //await video.destroy();
  return;

}

async function deleteAccount(user) {

  //Get list of videos made by user
  const videos = await videos.findAll({where: {uploader: user.username}});

  //Delete videos
  for (let i = 0; i < videos.length; i++) {
    await deleteVideo(videos[i]);
  }

  //Delete remaining comments
  const comments = await Comments.findAll({where: {user: user.username}})
  await deleteComments(comments);

  //NEED TO DELETE VIDEO VOTES AND COMMENT VOTES
  //AND SUBSCRIPTIONS (DONT FORGET TO UPDATE LIKE COUNTS ETC)
  //MAKE HELPER FUNCTIONS TO DO THIS

  console.log("NEED TO IMPLEMENT REMOVING BOOKMARKS WHEN DELETING USER");
  await user.destroy();
  return;
}

module.exports = {asyncHandler, formatDay, formatDate, formatTimeSince, formatTitle, 
  formatViews, checkUploadData, checkForErrors, signupErrors, getCommentsForVideo, deleteComments, deleteVideo};