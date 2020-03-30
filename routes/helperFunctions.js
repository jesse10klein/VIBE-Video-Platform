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

  if (days > 1) {
    if (days == 1) timePassed = "Posted 1 day ago";
    else timePassed = days + " days ago";
  } else if (hours > 0) {
    if (hours == 1) timePassed = "1 hour ago";
    else timePassed = "Posted " + hours + " hours ago";
  } else if (minutes > 0) {
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

module.exports = {asyncHandler, formatDay, formatDate, formatTimeSince, formatTitle, formatViews, checkUploadData, checkForErrors};