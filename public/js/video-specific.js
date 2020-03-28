console.log('Client-side code running');

const div = document.getElementById("description-info");
const descButton = document.getElementById("descButton");

const comment = document.getElementById("comment");
const user = document.getElementById("username");

const subButton = document.getElementById('subscribeButton');

window.onresize = resizeVideo;
window.onload = resizeVideo; 

function resizeVideo() {

  console.log(window.innerWidth);

  //Get video and change dimensions
  const video = document.getElementById("video");

  //Only resize if window width is greater than 1220
  if (window.innerWidth < 1220)  {
    return;
  } else if (window.innerWidth > 1540) {
    video.style.width = 1100 + "px";
    video.style.minHeight = 1100 / 1.77 + "px";
    video.style.maxHeight = 1100 / 1.77 + "px";
    return;
  }
  //Width - width of sidebar - 40px padding (20 each side)
  const roomForVideo = window.innerWidth - 400 - 40;

  video.style.width = roomForVideo + "px";
  //The 1.77 is based off popular video height/width ratios
  video.style.minHeight = roomForVideo / 1.77 + "px";
  video.style.maxHeight = roomForVideo / 1.77 + "px";

  console.log(video.style);
  console.log(subButton);

};


function processUpvote() {
  fetch( window.location.pathname + '/addUpvote', {method: 'POST'})
  .then( response =>  {
    if(response.status == 200) {
      const count = document.getElementById('upvoteCount');
      count.innerText = parseInt(count.innerText) + 1;
      return;
    } else if (response.status == 202) {
      window.alert("You must be logged in to vote on a video");
      return;
    } else if (response.status == 203) {
      return;
    } else if (response.status == 204) {
      const dcount = document.getElementById('downvoteCount');
      dcount.innerText = parseInt(dcount.innerText) - 1;
      const ucount = document.getElementById('upvoteCount');
      ucount.innerText = parseInt(ucount.innerText) + 1;
      return;
    } else {
    throw new Error('Request failed.');
    }
  })
  .catch(function(error) {
    console.log(error);
  });
}

function processDownvote() {
  fetch( window.location.pathname + '/addDownvote', {method: 'POST'})
  .then( response =>  {
    if(response.status == 200) {
      const count = document.getElementById('downvoteCount');
      count.innerText = parseInt(count.innerText) + 1;
      return;
    } else if (response.status == 202) {
      window.alert("You must be logged in to vote on a video");
      return;
    } else if (response.status == 203) {
      return;
    } else if (response.status == 204) {
      const ucount = document.getElementById('upvoteCount');
      ucount.innerText = parseInt(ucount.innerText) - 1;
      const dcount = document.getElementById('downvoteCount');
      dcount.innerText = parseInt(dcount.innerText) + 1;
      return;
    } else {
    throw new Error('Request failed.');
    }
  })
  .catch(function(error) {
    console.log(error);
  });
}

function addComment() {

  //Make sure comment isn't empty
  if (comment.value == "") {
    console.log(comment.value);
    return;
  }

  const toAdd = `<div class="comment"> 
                  <h1> ${user.textContent} </h1> 
                  <p> ${comment.value} </p> 
              </div>`;
  console.log(toAdd);
  const comments = document.getElementById("comments");
  const before = comments.innerHTML;
  comments.innerHTML = toAdd + before;
}

subButton.addEventListener('click', function(e) {

  if (subButton.className == "notLoggedIn") {
    window.alert("Log in to subscribe");
    return;
  }

  fetch( window.location.pathname + '/' + subButton.textContent.toLowerCase(), {method: 'POST'})
    .then( response =>  {
      if(response.ok) {
        if (subButton.textContent == "Subscribe") {
          subButton.textContent = "Unsubscribe";
            let subs = document.getElementById("subCount");
            const len = subs.textContent.length;
            const subCount = parseInt(subs.textContent.slice(0,len - 12));
            subs.textContent = (subCount + 1) + " Subscribers ";
        } else {
          subButton.textContent = "Subscribe";
            let subs = document.getElementById("subCount");
            const len = subs.textContent.length;
            const subCount = parseInt(subs.textContent.slice(0,len - 12));
            subs.textContent = (subCount - 1) + " Subscribers ";
        }
        return;
      }
      throw new Error('Request failed.');
    })
    .catch(function(error) {
      console.log(error);
    });
});

function toggleDescription() {

  if (div.style.visibility == 'visible') {
    div.style.visibility = 'hidden';
    div.style.display = 'none';
    descButton.textContent = 'Show Description';
  } else {
    div.style.visibility = 'visible';
    div.style.display = 'block';
    descButton.textContent = 'Hide Description';
  }
}