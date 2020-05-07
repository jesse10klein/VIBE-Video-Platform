console.log("userProfile.js");


window.onresize = resizeContent;
window.onload = resizeContent; 


function resizeContent() {

  console.log("resizing content");

  //Get video and change dimensions
  const content = document.getElementById("content");

  const sidebar_width = 200 + 20; // padding

   const width = window.innerWidth - sidebar_width;
   content.style.width = width + "px";

   const bannerDiv = document.getElementById("banner");
   //bannerDiv.style.width = width + "px";

   const bannerImage = document.getElementById("banner-image");
   bannerImage.style.width = width + "px";

};

function processSubscribe() {

  const subs = document.getElementById("subCount");
  const subButton = document.getElementById('subscribeButton');

  if (getCookie("username") == "") {
    window.location = "/users/login";
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


