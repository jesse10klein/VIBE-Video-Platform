console.log("userProfile.js");


window.onresize = resizeContent;
window.onload = resizeContent; 

let sidebar = $("#sidebar").attr("display") == 'none';

function toggleSidebar() {
  console.log("Toggling");
  const hamburger = $("#hamburger");
  const sidebar = $("#sidebar");
  console.log(hamburger.css('display'));
  console.log(sidebar.css('display'));
  if ((sidebar).css('display') == 'none') {
    sidebar.css('display', 'block');
    hamburger.css('display', 'none');
  } else {
    sidebar.css('display', 'none');
    hamburger.css('display', 'block');
  }
  resizeContent();
}

function resizeContent() {

  if ($("#sidebar").css('display') != 'none') {
    const content = document.getElementById("content");

    const sidebar_width = 200 + 0.1;

    const width = document.body.clientWidth - sidebar_width;
    content.style.width = width + "px";
    content.style.marginLeft = "200px";

    const bannerImage = document.getElementById("banner-image");
    bannerImage.style.width = width + "px";
  } else {
    const content = document.getElementById("content");
    content.style.width = document.body.clientWidth - 0.1 + "px";
    content.style.marginLeft = "0px";

    const bannerImage = document.getElementById("banner-image");
    bannerImage.style.width = document.body.clientWidth - 0.1 + "px";
  }
};

function processSubscribe() {

  const subs = document.getElementById("subcount");
  const subButton = document.getElementById('subscribeButton');

  if (getCookie("username") == "") {
    window.location = "/users/login";
  }

  const parts = window.location.pathname.split("/");
  const URL = "/" + parts[1] + "/" + parts[2] + "/handle-sub"; 

  fetch(URL, {method: 'POST'})
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


