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
  if (getCookie("username") == "") {
    loginAlert($(item), {message: "You must login to vote on a video"});
    return;
  }
  votePostRequest(pathname, primary, secondary)
}

function processCommentVote(item) {

  //Check if user is logged in
  if (getCookie("username") == "") {
    loginAlert($(item), {message: "You must login to vote on a comment"});
    return;
  }

  let primary = null;
  let secondary = null;
  let pathname = null;

  if (item.classList.contains("upVote")) {
    const commentID = item.parentElement.previousElementSibling.previousElementSibling.firstElementChild.innerText;
    primary = item.parentElement.previousElementSibling.firstElementChild;
    secondary = item.parentElement.nextElementSibling.firstElementChild;
    pathname = window.location.pathname + "/addCommentLike/" + commentID;
  } else {
    const commentID = item.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.firstElementChild.innerText;
    if (commentID == "👍") {
      return;
    }
    primary = item.parentElement.previousElementSibling.firstElementChild;
    secondary = item.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.firstElementChild;
    pathname = window.location.pathname + "/addCommentDislike/" + commentID;
  }
  console.log(pathname);
  console.log(primary);
  console.log(secondary);

  votePostRequest(pathname, primary, secondary);
}
