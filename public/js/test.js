console.log('Client-side code running');

const date = document.getElementById("date");
const description = document.getElementById("description");
const tags = document.getElementById("tags");
const descButton = document.getElementById("descButton");

const comment = document.getElementById("comment");
const user = document.getElementById("username");

const subButton = document.getElementById('subscribeButton');

function processUpvote() {
  
  fetch( window.location.pathname + '/addUpvote', {method: 'POST'})
    .then( response =>  {
      if(response.ok) {
        return;
      }
      throw new Error('Request failed.');
    })
    .catch(function(error) {
      console.log(error);
    });

  const count = document.getElementById('upvoteCount');
  count.innerText = parseInt(count.innerText) + 1;

}

function processDownvote() {

  fetch( window.location.pathname + '/addDownvote', {method: 'POST'})
  .then( response =>  {
    if(response.ok) {
      return;
    }
    throw new Error('Request failed.');
  })
  .catch(function(error) {
    console.log(error);
  });

const count = document.getElementById('downvoteCount');
count.innerText = parseInt(count.innerText) + 1;
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
      return;
  }

  fetch( window.location.pathname + '/' + subButton.textContent.toLowerCase(), {method: 'POST'})
    .then( response =>  {
      if(response.ok) {
        return;
      }
      throw new Error('Request failed.');
    })
    .catch(function(error) {
      console.log(error);
    });

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
});

function toggleDescription() {

  console.log("Button Clicked");

  if (date.style.visibility == 'visible') {
    descButton.innerText = "Show More";
    date.style.visibility = 'hidden';
    description.style.visibility = 'hidden';
    tags.style.visibility = 'hidden';
    console.log(tags.style.visibility);
  } else {
    descButton.innerText = "Show Less";
    date.style.visibility = 'visible';
    description.style.visibility = 'visible';
    tags.style.visibility = 'visible';
  }
}