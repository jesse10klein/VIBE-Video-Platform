function votePostRequest(pathname, primary, secondary) {
  fetch( pathname, {method: 'POST'})
  .then( response =>  {
    if(response.status == 200) {
      return response.json();
    }
    throw new Error("Request failed");
  }).then( data => {
    const pVotes = primary.innerText;
    const sVotes = secondary.innerText;
    const pNum = pVotes.toString().slice(pVotes.length - 1, pVotes.length);
    const sNum = sVotes.toString().slice(sVotes.length - 1);

    if (data.voteStatus == 1) { //Already upvoted, delete
      if (pVotes < 1000) { 
        primary.innerText = parseInt(primary.innerText) - 1;
      }
      return;
    } else if (data.voteStatus == 2) { //Not voted yet
      if (!(pNum == 'K' || pNum == 'M')) { 
        primary.innerText = parseInt(primary.innerText) + 1;
      }
      return;
    } else if (data.voteStatus == 3) { //Had it downvoted
      if (!(pNum == 'K' || pNum == 'M')) { 
        primary.innerText = parseInt(primary.innerText) + 1;
      }
      if (!(sNum == 'K' || sNum == 'M')) {
        secondary.innerText = parseInt(secondary.innerText) - 1;
      }
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
    loginAlert($(item), "You must login to vote on a video");
    return;
  }
  votePostRequest(pathname, primary, secondary)
}

function processCommentVote(item) {

  //Check if user is logged in
  if (getCookie("username") == "") {
    loginAlert($(item), "You must login to vote on a comment");
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
  votePostRequest(pathname, primary, secondary);
}
