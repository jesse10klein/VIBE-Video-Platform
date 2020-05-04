

let scrollAlert = false;

var currentFilter = "new";

var commentFilters = document.getElementById('filterOptions');
commentFilters.addEventListener("change", function () {
  if (currentFilter == commentFilters.value) {
    return;
  }
  currentFilter = commentFilters.value;
  //Delete all comments
  $("#comments").empty();
});

window.addEventListener('scroll', () => {

  if (scrollAlert) return;

  const scrolled = window.scrollY + window.innerHeight;

  scrollAlert = true;
  setTimeout(function () { scrollAlert = false; }, 500);


  const lastComment = $("#comments .comment").last();
  var commentID = lastComment.find(".commentID").text();
  const lastRec = $("#sidebar a").last();
  var videoID = lastRec.attr("href").split('/')[2];

  if (!(lastComment.length == 0)) {
    var commentBottom = lastComment.get(0).getBoundingClientRect().bottom;
    if ((commentBottom - scrolled) < 20) {
      getComments({lastCommentID: commentID});
    }
  }

  if (!(lastRec.length == 0) && (window.innerWidth > 1220)) {
    const vidsBottom = lastRec.get(0).getBoundingClientRect().bottom;
    if ((vidsBottom - scrolled) < 20) {
      getSidebarVideos({lastVideoID: videoID});
    }
  }
  
})
  
function getSidebarVideos(data) {

  url = window.location.pathname + "/video-payload/";
  $.ajax({
    url, type: "POST", data, dataType: 'json',
    success: function(response) {
      if (response.videos.length > 0) {
        addVideos(response);
      }
      
    }
  })
}

function getComments(data) {
  const sortingType = $("#filterOptions").val();
  url = window.location.pathname + "/comment-payload/" + sortingType;
  $.ajax({
    url, type: "POST", data, dataType: 'json',
    success: function(response) {
      if (response.comments.length > 0) {
        addComments(response);
      }
      
    }
  })
}

function addComments(response) {
  const { comments } = response;
  for (comment of comments) {
    const commentHTML = formatPayloadComment(comment, comment.imageURL);
    //Append comment
    $("#comments").append(commentHTML);
  }
}

function addVideos(response) {
  
    const { videos } = response;
    for (video of videos) {
      const videoHTML = formatSidebarVideoHTML(video);
      $("#sidebar").append(videoHTML);
    }
    animateSidebarVideos();
}

function addReplies(element, response) {
  //Need to add replies after response

  element.innerHTML = "Hide replies";

  let HTML = "";
  for (let i = 0; i < response.replies.length; i++) {
    const reply = response.replies[i];
    replyHTML = formatPayloadReply(reply, reply.imageURL);
    HTML += replyHTML;
  }

  const node = $($.parseHTML(HTML));
  (node).insertAfter($(element));

}

function hideReplies(element) {

  //Just delete the replies don't hide, they can be loaded later

  //Count replies 
  const button = $(element);
  let count = 0;

  let next = button.next();
  while (next.hasClass("reply")) {
    count++;
    const old = next;
    next = next.next();
    old.remove();
  }

  element.innerHTML = `Load ${count} replies`;

}

function loadReplies(element) {

  if (element.innerHTML == "Hide replies") {
    hideReplies(element);
    return;
  }

  
  const sortingType = $("#filterOptions").val();

  const commentID = element.classList[0];
  const url = window.location.pathname + '/reply-payload/' + sortingType;
  const data = {commentID};

  $.ajax({
    url, type: "POST", data, dataType: 'json',
    success: function(response) {
      addReplies(element, response);
    }
  })

}

function formatSidebarVideoHTML(video) {
    const formattedHTML = `
      <div class="video-preview">
        <a href="/video/${video.id}">
          <video class="sidebar-video" src="/videos/${video.videoURL}" muted>
          </video>
          <div id="svidinfo">
            <h1>${video.title}</h1>
            <h2>${video.uploader}</h2>
            <h3>${video.viewCount} Views</h3>
            <h3>${video.uploadDate}</h3>
          </div>
        </a>
      </div>`
      return formattedHTML;
}

function formatPayloadComment(comment, imageURL) {

  let HTML = ` <div class="comment">
                    <div class="image">
                      <a class="thumb-holder" href="/users/${comment.user}"}>
                        <img src="/images/user-thumbs/${imageURL}">
                      </a>
                    </div>
                    <div class="comment-content">
                      <div class="comment-header">
                        <a class="commentUsername" href="/users/${comment.user}">${comment.user}</a>
                        <p> ${comment.formattedDate} </p>
                      </div>
                      <p class="commentBody">${comment.comment}</p>
                      <div class="comment-footer">
                        <div> 
                          <p class="commentID">${comment.id}</p>
                        </div> 
                        <div>
                          <p class="commentLikes">${comment.commentLikes}</p>
                        </div> 
                        <div>
                          <button class="upVote" onclick="processCommentVote(this)">👍</button>
                        </div> 
                        <div>
                          <p class="commentDislikes">${comment.commentDislikes}</p>
                        </div> 
                        <div>
                          <button class="downVote" onclick="processCommentVote(this)">👎</button>
                        </div> 
                        <div>
                          <button class="replyButton" onclick="toggleReplyBox(this)">Reply</button>
                        </div>`
                      if (comment.byUser) {
                        HTML += `
                        <div>
                          <button onclick="editComment(this)">Edit</button>
                        </div>
                        <div>
                          <button id=${comment.id} onClick="deleteComment(this)"> Delete </button>
                        </div>`
                      }
                      if (comment.edited) {
                        HTML += `
                        <div>
                          <p class="edited">(Edited)</p>
                        </div>
                        `
                      }
                    HTML += `
                      </div>
                    </div>
                  </div>
                  `
                  if (comment.numReplies) {
                    HTML += `
                      <button class="${comment.id}" onclick="loadReplies(this)">Load ${comment.numReplies} replies</button>
                    `
                  }
                  HTML += `
                    <div class="reply-form">
                      <textarea class="comment-reply" name="reply"> </textarea>
                      <button class="post-reply" onClick="postReply(this)"> Reply </button>
                    </div>`;
  return HTML;
}

function formatPayloadReply(reply, imageURL) {
  let HTML = ` <div class="reply">
                  <div class="image">
                    <a class="thumb-holder" href="/users/${reply.user}"}>
                      <img src="/images/user-thumbs/${imageURL}">
                    </a>
                  </div>
                  <div class="comment-content">
                    <div class="comment-header">
                      <a class="commentUsername" href="/users/${reply.user}">${reply.user}</a>
                      <p> Posted ${reply.formattedDate} </p>
                    </div>
                    <p class="commentBody">${reply.comment}</p>
                    <div class="comment-footer">
                      <div>
                        <p class="commentID">${reply.id}</p>
                      </div> 
                      <div>
                        <p class="commentLikes">${reply.commentLikes}</p>
                      </div> 
                      <div>
                        <button class="upVote" onclick="processCommentVote(this)">👍</button>
                      </div> 
                      <div>
                        <p class="commentDislikes">${reply.commentDislikes}</p>
                      </div> 
                      <div>
                        <button class="downVote" onclick="processCommentVote(this)">👎</button>
                      </div>`
                        if (reply.byUser) {
                          HTML += `
                          <div>
                            <button onclick="editComment(this)">Edit</button>
                          </div>
                          <div>
                            <button id=${comment.id} onClick="deleteComment(this)"> Delete </button>
                          </div>`
                        }
                        if (reply.edited) {
                          HTML += `
                          <div>
                            <p class="edited">(Edited)</p>
                          </div>
                          `
                        }
                      HTML += `
                    </div>
                  </div>
                </div>`;
return HTML;
}