console.log('Client-side code running');

const div = document.getElementById("description-info");
const descButton = document.getElementById("descButton");

const comment = document.getElementById("comment");
const user = document.getElementById("username");

const subButton = document.getElementById('subscribeButton');

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

  if (subButton.textContent != "Subscribe" && subButton.textContent != "Unsubscribe") {
    window.alert("Log in to subscribe");
  }

  fetch( window.location.pathname + '/' + subButton.textContent.toLowerCase(), {method: 'POST'})
    .then( response =>  {
      if(response.ok) {
        if (subButton.textContent == "Subscribe") {
          subButton.textContent = "Unsubscribe";
            let subs = document.getElementById("subCount");
            const subCount = parseInt(subs.textContent.slice(12));
            subs.textContent = "Subscribers " + (subCount + 1);
        } else {
          subButton.textContent = "Subscribe";
            let subs = document.getElementById("subCount");
            const subCount = parseInt(subs.textContent.slice(12));
            subs.textContent = "Subscribers " + (subCount - 1);
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
  } else {
    div.style.visibility = 'visible';
    div.style.display = 'block';
  }
}