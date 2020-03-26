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

  let days = sinceUpload / (1000 * 60 * 60 * 24);
  if (days > 1) {
    days = Math.ceil(days);
  }
  console.log(days);
  const hours = Math.ceil(sinceUpload / (1000 * 60 * 60));
  const minutes =  Math.ceil(sinceUpload / (1000 * 60));

  console.log("days: " + days + " hours: " + hours + " minutes: " + minutes);


  if (days > 1) {
    if (days == 1) timePassed = "Posted 1 day ago";
    else timePassed = days + " days ago";
  } else if (hours > 0) {
    if (hours == 1) timePassed = "1 hour ago";
    else timePassed = "Posted " + hours + " hours ago";
  } else if (minutes > 0) {
    if (minutes < 3) timePassed = "just now";
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

module.exports = {asyncHandler, formatDay, formatDate, formatTimeSince, formatTitle, formatViews};