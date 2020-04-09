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

function postComment() {

  //Get comment
  const data = { comment: $('#comment').val() };
  const url = window.location.pathname + "/add-comment";

  $.ajax({
      url, type: "POST", data,
      success: function(response) {
        const commentFormatted = formatCommentHTML(response);
        $('#comments').prepend(commentFormatted);
      }
  })

}

//Need store reply in database and attach to dom
function postReply(item) {

  const data = {reply: item.previousElementSibling.value};
  const replyID = item.parentNode.previousElementSibling.firstElementChild.firstElementChild.innerText;
  const replyComment = item.parentNode.parentNode;

  const url = window.location.pathname + "/add-reply/" + replyID;

  $.ajax({
      url, type: "POST", data,
      success: function(response) {
        const replyFormatted = formatReplyHTML(response);
        const node = $($.parseHTML(replyFormatted))
        const comment = $(replyComment);
        (node).insertAfter(comment);
        
        //Now close reply box
        const toggleReplyButton = $(replyComment).find(".replyButton");
        toggleReplyBox(toggleReplyButton.get(0));
      }
  })

}

function formatCommentHTML(comment) {

  const html = ` <div class="comment">
                    <h1 class="commentUsername">${comment.user}</h1>
                    <p class="commentBody">${comment.comment}</p>
                    <div class="footer">
                      <div class="votes">
                        <p class="commentID">${comment.id}</p>
                        <p class="commentLikes">0</p>
                        <button class="upVote" onclick="processCommentVote(this)">👍</button>
                        <p class="commentDislikes">0</p><button class="downVote" onclick="processCommentVote(this)">👎</button>
                        <button class="replyButton" onclick="toggleReplyBox(this)">Reply</button>
                      </div>
                      <p> Posted Just now </p>
                      <button id=${comment.id} onClick="deleteComment(this)"> Delete </button>
                    </div>
                    <div class="reply-form">
                      <textarea class="comment-reply" name="reply"> </textarea>
                      <button class="post-reply" onClick="postReply(this)"> Reply </button>
                    </form>
                  </div>`;
  return html;
}

function formatReplyHTML(reply) {
  const html = ` <div class="reply">
                    <h1 class="commentUsername">${reply.user}</h1>
                    <p class="commentBody">${reply.comment}</p>
                    <div class="footer">
                      <div class="votes">
                        <p class="commentID">${reply.id}</p>
                        <p class="commentLikes">0</p>
                        <button class="upVote" onclick="processCommentVote(this)">👍</button>
                        <p class="commentDislikes">0</p><button class="downVote" onclick="processCommentVote(this)">👎</button>
                      </div>
                      <p> Posted just now </p>
                      <button id=${reply.id} onClick="deleteComment(this)"> Delete </button>
                    </div>
                  </div>`;
return html;
}

function toggleReplyBox(item) {

  const user = getCookie("username");
  if (user == "") {
    alert("You must be logged in to reply to a comment");
    return;
  }

  
  const form = item.parentNode.parentNode.nextElementSibling;

  if (form.style.display == 'block') {
    form.style.display = 'none';
    return;
  } else {
    form.style.display = "block";
  }

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

function deleteComment(element) {

  const commentID = element.id;
  const path = window.location.pathname + '/delete-comment/' + commentID;

  const comment = element.parentElement.parentElement;

  fetch( path, {method: 'POST'})
  .then( response =>  {
    if(response.ok) {

      //Then remove comment from page
      //NOTE: If removing a comment with replies, all replies need to be removed

      let _old = $(comment);
      
      while (true) {
        let _new = _old.next();
        _old.remove();

        if (_new.hasClass("reply")) {
          _old = _new;
        } else {
          break;
        }
      }

      alert("Comment successfully deleted");
      return;
    }
    throw new Error('Request failed.');
  })
  .catch(function(error) {
    console.log(error);
  });
}
