console.log('Client-side code running');
console.log(decodeURIComponent(document.cookie));

const div = document.getElementById("description-info");
const descButton = document.getElementById("descButton");
const subButton = document.getElementById('subscribeButton');

let alerting = false;

function loginAlert(item, message) {

  //Make it pop up from the clicked element with a custom message

  console.log(item);
  console.log(message);
  return;

  const html = `
  
    <h2> ${message.title} </h2>
    <p> ${message.body} </p>
    <a href="/users/login"> Log in </a>
  
  `

  /*
  setTimeout(() => {
    loginAlert.addClass("hidden");
    alerting = false;
  }, 4000);
  */


}

function formatNumber(number) {
  if (number < 1000) {
    return number;
  } else if (number < 1000000) {
    return Math.floor(number / 1000) + "K";
  } else {
    return Math.floor(number / 1000000) + "M";
  }
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

function animateSidebarVideos() {
  sidebarVideos = document.querySelectorAll('.sidebar-video');
  for (let i = 0; i < sidebarVideos.length; i++) {
    $(sidebarVideos[i]).hover(function() {
      sidebarVideos[i].play();
    }, function() {
      sidebarVideos[i].pause();
    })
  }

}

function initiatePage() {
  const video = document.getElementById("video");
  video.volume = 0.25;
  resizeVideo();
  animateSidebarVideos();
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
};

function postComment() {

  //Get comment
  const data = { comment: $('#comment').val() };
  const url = window.location.pathname + "/add-comment";

  $.ajax({
      url, type: "POST", data,
      success: function(response) {
        const commentFormatted = formatCommentHTML(response.comment, response.imageURL);
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

function formatCommentHTML(comment, imageURL) {

  const html = ` <div class="comment">
                    <div class="image">
                      <a class="thumb-holder" href="/users/${comment.user}"}>
                        <img src="/images/user-thumbs/${imageURL}">
                      </a>
                    </div>
                    <div class="comment-content">
                      <div class="comment-header">
                        <a class="commentUsername" href="/users/${comment.user}">${comment.user}</a>
                        <p> Posted Just now </p>
                      </div>
                      <p class="commentBody">${comment.comment}</p>
                      <div class="comment-footer">
                        <div> 
                          <p class="commentID">${comment.id}</p>
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
                          <button onclick="editComment(this)">Edit</button>
                        </div>
                        <div>
                          <button id=${comment.id} onClick="deleteComment(this)"> Delete </button>
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

function formatReplyHTML(reply, imageURL) {
  const html = ` <div class="reply">
                  <div class="image">
                    <a class="thumb-holder" href="/users/${reply.user}"}>
                      <img src="/images/user-thumbs/${imageURL}">
                    </a>
                  </div>
                  <div class="comment-content">
                    <div class="comment-header">
                      <a class="commentUsername" href="/users/${reply.user}">${reply.user}</a>
                      <p> Posted just now </p>
                    </div>
                    <p class="commentBody">${reply.comment}</p>
                    <div class="comment-footer">
                      <div>
                        <p class="commentID">${reply.id}</p>
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
                          <button onclick="editComment(this)">Edit</button>
                      </div>
                      <div>
                        <button id=${reply.id} onClick="deleteComment(this)"> Delete </button>
                      </div>
                    </div>
                  </div>
                </div>`;
return html;
}

function toggleReplyBox(item) {

  if (getCookie("username") == "") {
    loginAlert($(item), {message: "You must login to reply to comments"});
    window.location.pathname = '/users/login';
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

  const subs = document.getElementById("subCount");

  if (getCookie("username") == "") {
    loginAlert($('#subscribeButton'), {message: "Please login to subscribe"});
    window.location.pathname = '/users/login';
    return;
  }


  fetch( window.location.pathname + '/handle-sub', {method: 'POST'})
    .then( response =>  {
      if(response.ok) {
        return response.json();
      }
      throw new Error('Request failed.');
    }).then( data => {

      //Data sent will be sub status and sub count
      subButton.textContent = data.subscribeStatus;
      subs.textContent = `${formatNumber(data.subscribers)} Subscribers`
     
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

function applyEdit(element) {

  const body = $(element.previousElementSibling).val();
  const commentID = $(element.parentElement.parentElement).find('.commentID').text();
  const url = window.location.pathname + "/edit-comment";
  const data = {comment: body, commentID};

  $.ajax({
    url, type: "POST", data,
    success: function(response) {

      const commentContent = element.parentElement;

      if ($(commentContent).find('.edited').length == 0) {
        const node = $($.parseHTML(`<div> <p class="edited"> (Edited) </p> </div>`));
        $(commentContent).find('.comment-footer').append(node);
      }

      const node = $($.parseHTML(`<p class="commentBody">${body}</p>`));
      node.insertAfter($(element));
      $(element).prev().remove();
      $(element).remove();
    }
  })
}

function editComment(element) {

  const commentBody = element.parentElement.parentElement.previousElementSibling;

  if (!$(commentBody).hasClass('commentBody')) {
    return;
  }

  const text = commentBody.innerText;


  //Get text from p and set in textbox
  const html = `
    <textarea class="editComment"> ${text}  </textarea>
    <button class="applyEdit" onclick=applyEdit(this)> Apply Edit </button>
  `;

  const node = $($.parseHTML(html));
  node.insertAfter($(commentBody));
  $(commentBody.remove());

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

      //it will either be a comment or a reply
      let toDelete = $(comment);
      
      if (toDelete.hasClass("reply")) {
        toDelete.remove();
        alert("reply successfully removed");
        return;
      } if (!toDelete.hasClass("comment")) {
        alert("SOMETHING WRONG IN DELETE COMMENTS FUNCTION");
      }

      //If we get here, it's a comment
      let replyForm = toDelete.next();
      let potentialReply = replyForm.next();

      toDelete.remove();
      replyForm.remove();

      while (potentialReply.hasClass("reply")) {
        let _old = potentialReply;
        potentialReply = potentialReply.next();
        _old.remove();
      }
      alert("Comment successfully deleted");
      

    }
    throw new Error('Request failed.');
  })
  .catch(function(error) {
    console.log(error);
  });
}

function processBookmark() {
  
  if (getCookie("username") == "") {
    loginAlert($('#bookmark'), {message: "Please log in to bookmard this video"});
    window.location.pathname = '/users/login';
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
