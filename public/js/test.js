console.log('Client-side code running');

const date = document.getElementById("date");
const description = document.getElementById("description");
const tags = document.getElementById("tags");
const descButton = document.getElementById("descButton");


const button = document.getElementById('myButton');
button.addEventListener('click', function(e) {

  if (button.textContent != "Subscribe" && button.textContent != "Unsubscribe") {
      return;
  }

  fetch( window.location.pathname + '/' + button.textContent.toLowerCase(), {method: 'POST'})
    .then( response =>  {
      if(response.ok) {
        return;
      }
      throw new Error('Request failed.');
    })
    .catch(function(error) {
      console.log(error);
    });

  if (button.textContent == "Subscribe") {
      button.textContent = "Unsubscribe";
      let subs = document.getElementById("subCount");
      const subCount = parseInt(subs.textContent.slice(12));
      subs.textContent = "Subscribers " + (subCount + 1);
  } else {
      button.textContent = "Subscribe";
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