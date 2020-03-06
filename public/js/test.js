console.log('Client-side code running');
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