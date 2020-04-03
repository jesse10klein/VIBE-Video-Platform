console.log('Client-side code running');

const div = document.getElementById("description-info");
const descButton = document.getElementById("descButton");
const subButton = document.getElementById('subscribeButton');


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


window.onresize = resizeVideo;
window.onload = initiatePage; 

function initiatePage() {
  const video = document.getElementById("video");
  video.volume = 0.25;
  resizeVideo();

}

function resizeVideo() {

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

};

function addComment() {

  const comment = document.getElementById("comment");
  const user = getCookie("username");

  //Make sure comment isn't empty
  if (comment.value == "") {
    return;
  }

  const toAdd = `<div class="comment"> 
                  <h1 class="commentUsername"> ${user} </h1> 
                  <p class"commentBody"> ${comment.value} </p>
                  <p> Posted just now </p>
                  <div class="votes">
                    <p class="commentID"> NULL </p>
                    <p class=commentLikes"> 0 </p>
                    <button class="upVote" onclick="processCommentVote(this)">👍</button>
                    <p class="commentDislikes">0</p>
                    <button class="downVote" onclick="processCommentVote(this)">👎</button>
                  </div>
                </div>`
             
  const comments = document.getElementById("comments");
  const node = document.createElement("div");
  node.innerHTML = toAdd;
  comments.insertBefore(node, comments.firstChild);

}

function toggleReplyBox(item) {

  const user = getCookie("username");
  if (user == "") {
    alert("You must be logged in to reply to a comment");
    return;
  }

  const form = item.parentElement.nextSibling;
  form.style.display = "block";

}


//Need the item as we have to add it under a given comment
function addReplyComment(item) {

  const textArea = item.childNodes[0].childNodes[0];
  const user = getCookie("username");

  const toAdd = `<div class="comment"> 
                  <h1 class="commentUsername"> ${user} </h1> 
                  <p class"commentBody"> ${textArea.value} </p>
                  <p> Posted just now </p>
                  <div class="votes">
                    <p class="commentID"> NULL </p>
                    <p class=commentLikes"> 0 </p>
                    <button class="upVote" onclick="processCommentVote(this)">👍</button>
                    <p class="commentDislikes">0</p>
                    <button class="downVote" onclick="processCommentVote(this)">👎</button>
                  </div>
                </div>`;

  var node = document.createElement("DIV");
  node.innerHTML = toAdd;
  const comment = item.parentElement;
  comment.appendChild(node);

}

subButton.addEventListener('click', function(e) {

  if (getCookie("username") == "") {
    window.alert("Log in to subscribe");
    return;
  }

  const subs = document.getElementById("subCount");

  fetch( window.location.pathname + '/handle-sub', {method: 'POST'})
    .then( response =>  {
      if(response.ok) {
        return response.json();
      }
      throw new Error('Request failed.');
    }).then( data => {

      //Data sent will be sub status and sub count
      subButton.textContent = data.subscribeStatus;
      subs.textContent = `${data.subscribers} Subscribers`
     
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