console.log('Client-side code running');
console.log(decodeURIComponent(document.cookie));

const div = document.getElementById("description-info");
const descButton = document.getElementById("descButton");
const subButton = document.getElementById('subscribeButton');

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
  const other = document.getElementById("videoinfo");
  const other1 = document.getElementById("videoTitle");
  const last1 = document.getElementById("firstInfo");
  const descButton = document.getElementById("descButton");
  const description = document.getElementById("description-info");

  console.log(window.innerWidth);

  //Only resize if window width is greater than 1220
  if (window.innerWidth < 900) {
    const room = window.innerWidth - 100
    video.style.width = room + "px";
    video.style.minHeight = room / 1.77 + "px";
    video.style.maxHeight = room / 1.77 + "px";
    other.style.width = room + "px";
    other.style.marginLeft = 50 + "px";
    description.style.width = room + "px";
    description.style.marginLeft = 50 + "px";
    other1.style.marginLeft = 50 + "px";
    descButton.style.marginLeft = 50 + 75 + "px";
    last1.style.marginLeft = 50 + "px";
    return;
  }
  else if (window.innerWidth < 1220)  {
    const room = 1220 - 350
    video.style.width = room + "px";
    video.style.minHeight = room / 1.77 + "px";
    video.style.maxHeight = room / 1.77 + "px";
    other.style.width = room + "px";
    other.style.marginLeft = (window.innerWidth - 1220 - 350) / 2 + 350 + "px";
    description.style.width = room + "px";
    description.style.marginLeft = (window.innerWidth - 1220 - 350) / 2 + 350 + "px";
    other1.style.marginLeft = (window.innerWidth - 1220 - 350) / 2 + 350 + "px";
    descButton.style.marginLeft = (window.innerWidth - 1220 - 350) / 2 + 350 + 75  + "px";
    last1.style.width = room + "px";
    last1.style.marginLeft = (window.innerWidth - 1220 - 350) / 2 + 350 + "px";
    return;
  } else if (window.innerWidth > 1340) {
    console.log("HERE");
    const room = 1340 - 450;
    video.style.width = room + "px";
    video.style.minHeight = room / 1.77 + "px";
    video.style.maxHeight = room / 1.77 + "px";
    other.style.width = room + "px";
    other.style.marginLeft = (window.innerWidth - 1340 - 450) / 2 + 250 + "px";
    description.style.width = room + "px";
    description.style.marginLeft = (window.innerWidth - 1340 - 450) / 2 + 250 + "px";
    other1.style.marginLeft = (window.innerWidth - 1340 - 450) / 2 + 250 + "px";
    descButton.style.marginLeft = (window.innerWidth - 1340 - 450) / 2 + 250 + 75  + "px";
    last1.style.marginLeft = (window.innerWidth - 1340 - 450) / 2 + 250 + "px";
    last1.style.marginLeft = (window.innerWidth - 1340 - 450) / 2 + 250 + "px";
    return;
  } 
  console.log("Here");
  //Width - width of sidebar - 40px padding (20 each side)
  const roomForVideo = window.innerWidth - 400 - 40;
  video.style.width = roomForVideo + "px";
  //The 1.77 is based off popular video height/width ratios
  video.style.minHeight = roomForVideo / 1.77 + "px";
  video.style.maxHeight = roomForVideo / 1.77 + "px";
  other.style.width = roomForVideo + "px";
  other.style.marginLeft = 20 + "px";
  description.style.width = roomForVideo + "px";
  description.style.marginLeft = 20 + "px";
  other1.style.marginLeft = 20 + "px";
  descButton.style.marginLeft = 20 + 75  + "px";
  last1.style.marginLeft = 20 + "px";
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

        console.log(response);
        const replyFormatted = formatReplyHTML(response.comment, response.imageURL);
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
    loginAlert("You must login to reply to comments");
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
    loginAlert("Please login to subscribe");
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
    loginAlert("Please log in to bookmark this video");
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
