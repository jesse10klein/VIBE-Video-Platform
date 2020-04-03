function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function votePostRequest(pathname, primary, secondary) {
  fetch( pathname, {method: 'POST'})
  .then( response =>  {
    console.log(response);
    if(response.status == 200) {
      return response.json();
    }
    throw new Error("Request failed");
  }).then( data => {
    console.log(data);
    if (data.voteStatus == 1) { //Already upvoted, delete
      primary.innerText = parseInt(primary.innerText) - 1;
      return;
    } else if (data.voteStatus == 2) { //Not voted yet
      primary.innerText = parseInt(primary.innerText) + 1;
      return;
    } else if (data.voteStatus == 3) { //Had it downvoted
      secondary.innerText = parseInt(secondary.innerText) - 1;
      primary.innerText = parseInt(primary.innerText) + 1;
      return;
    }   
  })
  .catch(function(error) {
    console.log(error);
  });
}


function processVideoVote(item) {
  let primary = null;
  let secondary = null;
  let pathname = "";

  if (item.id == "upVote") {
    primary = document.getElementById("upvoteCount");
    secondary = document.getElementById("downvoteCount");
    pathname = window.location.pathname + '/addUpvote';
  } else {
    primary = document.getElementById("downvoteCount");
    secondary = document.getElementById("upvoteCount");
    pathname = window.location.pathname + '/addDownvote';
  }

  //Check if user is logged in
  if (getCookie("username") == null) {
    alert("You must be logged in to vote on a video");
    return;
  }
  votePostRequest(pathname, primary, secondary)
}

function processCommentVote(item) {

  let primary = null;
  let secondary = null;
  let pathname = null;

  if (item.classList.contains("upVote")) {
    const commentID = item.previousSibling.previousSibling.innerText;
    if (commentID == 0) {
      return;
    }
    primary = item.previousSibling;
    secondary = item.nextSibling;
    pathname = window.location.pathname + "/addCommentLike/" + commentID;
  } else {
    const commentID = item.previousSibling.previousSibling.previousSibling.previousSibling.innerText;
    if (commentID == "👍") {
      return;
    }
    primary = item.previousSibling;
    secondary = item.previousSibling.previousSibling.previousSibling;
    pathname = window.location.pathname + "/addCommentDislike/" + commentID;
  }

  console.log(primary);
  console.log(secondary);

  votePostRequest(pathname, primary, secondary);

}
