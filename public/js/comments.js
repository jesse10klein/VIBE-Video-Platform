



let scrollAlert = false;

window.addEventListener('scroll', () => {
    if (scrollAlert) return;
  
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
  
    if (Math.abs(scrolled - scrollable) > 20) {
      return;
    }
  
    scrollAlert = true;
    setTimeout(function () { scrollAlert = false; }, 500);
  
  
    const lastComment = $("#comments .comment").last();
  
    if (lastComment.length == 0) {
      console.log("No comments on this vid, nothing to load");
      return;
    }
  
    const commentID = lastComment.find(".commentID").text();
    const lastRec = $("#sidebar a").last();
    videoID = lastRec.attr("href").split('/')[2];
    data = {lastCommentID: commentID, lastVideoID: videoID};
    url = window.location.pathname + "/content-payload";
  
    console.log("About to send ajax");
  
    $.ajax({
      url, type: "POST", data, dataType: 'json',
      success: function(response) {
        console.log(response)
        if (response.comments.length > 0 || response.videos.length > 0) {
          addContent(response);
        }
        
      }
    })
  })
  
function addContent(response) {
  
    const { comments } = response;
    const { videos } = response;
  
    for (comment of comments) {
  
      const commentHTML = formatPayloadComment(comment, comment.imageURL);
      //Append comment
      $("#comments").append(commentHTML);
    }
  
    for (video of videos) {
      const videoHTML = formatSidebarVideoHTML(video);
      $("#sidebar").append(videoHTML);
    }
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


  const commentID = element.classList[0];
  const url = window.location.pathname + '/reply-payload';
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
          <video class="sidebar-video" src="/videos/${video.videoURL}" volume="0.5">
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