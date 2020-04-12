console.log('Client-side code running');

const div = document.getElementById("description-info");
const descButton = document.getElementById("descButton");
const subButton = document.getElementById('subscribeButton');

let alerting = false;

function toggleLoginAlert() {
  if (alerting) {
    return;
  }

  const loginAlert = $("#login-alert");
  loginAlert.removeClass("hidden");
  alerting = true;

  setTimeout(() => {
    loginAlert.addClass("hidden");
    alerting = false;
  }, 4000);
}


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
  const other = document.getElementById("videocontent");

  //Only resize if window width is greater than 1220
  if (window.innerWidth < 1220)  {
    return;
  } else if (window.innerWidth > 1540) {
    video.style.width = 1100 + "px";
    video.style.minHeight = 1100 / 1.77 + "px";
    video.style.maxHeight = 1100 / 1.77 + "px";
    other.style.width = 1100 + "px";
    other.style.marginLeft = "100px";
    return;
  }
  //Width - width of sidebar - 40px padding (20 each side)
  const roomForVideo = window.innerWidth - 400 - 40;

  video.style.width = roomForVideo + "px";
  //The 1.77 is based off popular video height/width ratios
  video.style.minHeight = roomForVideo / 1.77 + "px";
  video.style.maxHeight = roomForVideo / 1.77 + "px";

  other.style.width = roomForVideo + "px";
  other.style.marginLeft = "0px";
  console.log(other);
  console.log(other.style.width);

};

function postComment() {

  //Get comment
  const data = { comment: $('#comment').val() };
  const url = window.location.pathname + "/add-comment";

  $.ajax({
      url, type: "POST", data,
      success: function(response) {
        console.log(response);
        console.log(response.imageURL);
        const commentFormatted = formatCommentHTML(response);
        $('#comments').prepend(commentFormatted);
        //Empty comment box
        $('#comment').val("");
      }
  })

}

//Need store reply in database and attach to dom
function postReply(item) {

  const data = {reply: item.previousElementSibling.value};
  const replyID = $(item.parentNode.previousElementSibling).find('.commentID').text();
  const replyComment = item.parentNode.previousElementSibling;

  const url = window.location.pathname + "/add-reply/" + replyID;

  $.ajax({
      url, type: "POST", data,
      success: function(response) {
    
        //Now close reply box
        const toggleReplyButton = $(replyComment).find(".replyButton");
        toggleReplyBox(toggleReplyButton.get(0));


        const replyFormatted = formatReplyHTML(response);
        const node = $($.parseHTML(replyFormatted))
        const comment = $(replyComment.nextElementSibling);
        (node).insertAfter(comment);
      }
  })

}

function formatCommentHTML(comment) {

  const html = ` <div class="comment">
                    <div class="image">
                      <img src='/images/user-thumbs/${comment.imageURL}'>
                    </div>
                    <div class="comment-content">
                      <div class="comment-header">
                        <h1 class="commentUsername">${comment.comment.user}</h1>
                        <p> Posted Just now </p>
                      </div>
                      <p class="commentBody">${comment.comment.comment}</p>
                      <div class="comment-footer">
                        <div> 
                          <p class="commentID">${comment.comment.id}</p>
                        </div> 
                        <div>
                          <p class="commentLikes">0</p>
                        </div> 
                        <div>
                          <button class="upVote" onclick="processCommentVote(this)">👍</button>
                        </div> 
                        <div>
                          <p class="commentDislikes">0</p>
                        </div> 
                        <div>
                          <button class="downVote" onclick="processCommentVote(this)">👎</button>
                        </div> 
                        <div>
                          <button class="replyButton" onclick="toggleReplyBox(this)">Reply</button>
                        </div> 
                        <div>
                          <button id=${comment.comment.id} onClick="deleteComment(this)"> Delete </button>
                        </div>
                      </div>
                    </div>
                  </div>
                    <div class="reply-form">
                      <textarea class="comment-reply" name="reply"> </textarea>
                      <button class="post-reply" onClick="postReply(this)"> Reply </button>
                    </div>`;
  return html;
}

function formatReplyHTML(reply) {
  const html = ` <div class="reply">
                  <div class="image">
                    <img src="/images/user-thumbs/${reply.imageURL}">
                  </div>
                  <div class="comment-content">
                    <div class="comment-header">
                      <h1 class="commentUsername">${reply.comment.user}</h1>
                      <p> Posted just now </p>
                    </div>
                    <p class="commentBody">${reply.comment.comment}</p>
                    <div class="comment-footer">
                      <div>
                        <p class="commentID">${reply.comment.id}</p>
                      </div> 
                      <div>
                        <p class="commentLikes">0</p>
                      </div> 
                      <div>
                        <button class="upVote" onclick="processCommentVote(this)">👍</button>
                      </div> 
                      <div>
                        <p class="commentDislikes">0</p>
                      </div> 
                      <div>
                        <button class="downVote" onclick="processCommentVote(this)">👎</button>
                      </div> 
                      <div>
                        <button id=${reply.comment.id} onClick="deleteComment(this)"> Delete </button>
                      </div>
                    </div>
                  </div>
                </div>`;
return html;
}

function toggleReplyBox(item) {

  const user = getCookie("username");
  if (user == "") {
    toggleLoginAlert();
    return;
  }

  
  const form = item.parentNode.parentNode.parentNode.parentNode.nextElementSibling;

  if (form.style.display == 'flex') {
    form.style.display = 'none';
    form.firstElementChild.value = '';
    return;
  } else {
    form.style.display = "flex";
  }

}

function processSubscribe() {

  if (getCookie("username") == "") {
    toggleLoginAlert();
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
};

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

  const comment = element.parentElement.parentElement.parentElement.parentElement;

  fetch( path, {method: 'POST'})
  .then( response =>  {
    if(response.ok) {

      //Then remove comment from page
      //NOTE: If removing a comment with replies, all replies need to be removed

      let _old = $(comment);

      if (_old.hasClass("reply")) {
        _old.remove();
        alert("Comment successfully deleted");
        return;
      } else {
        let replyBox = _old.next();
        _old.remove();
        _old = replyBox.next();
        replyBox.remove();
      }
      
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

function processBookmark() {
  
  if (getCookie("username") == "") {
    toggleLoginAlert();
    return;
  }
  const path = window.location.pathname + '/bookmark-video';

  fetch( path, {method: 'POST'})
    .then( response =>  {
      if(response.ok) {
        return response.json();
      }
      throw new Error('Request failed.');
    }).then( data => {
      if (data.added) {
        alert("Bookmark added");
      } else {
        alert("Bookmark removed");
      }
    })
    .catch(function(error) {
      console.log(error);
    });
}
