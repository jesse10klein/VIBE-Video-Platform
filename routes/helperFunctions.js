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

function formatCommentDate(commentDate) {

  const date = Date.parse(commentDate);
  const now = Date.now();
  const sinceUpload = now - date;

  let timePassed = "NULL";

  const days = Math.ceil(sinceUpload / (1000 * 60 * 60 * 24));
  const hours = Math.ceil(sinceUpload / (1000 * 60 * 60));
  const minutes =  Math.ceil(sinceUpload / (1000 * 60));

  if (days > 0) {
    if (days == 1) timePassed = "Posted 1 day ago";
    else timePassed = "Posted " + days + " days ago";
  } else if (hours > 0) {
    if (hours == 1) timePassed = "Posted 1 day ago";
    else timePassed = "Posted " + hours + " hours ago";
  } else if (minutes > 0) {
    if (minutes < 3) timePassed = "Posted just now";
    else timePassed = "Posted " + minutes + " minutes ago";
  } 
  
  return timePassed;
}

module.exports = {asyncHandler, formatDay, formatDate, formatCommentDate};