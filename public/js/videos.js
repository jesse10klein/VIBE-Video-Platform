

 
window.onload = animateVideos; 
 
 
function animateVideos() {
  sidebarVideos = document.querySelectorAll('.video-preview video');
  for (let i = 0; i < sidebarVideos.length; i++) {
    $(sidebarVideos[i]).hover(function() {
      sidebarVideos[i].play();
    }, function() {
      sidebarVideos[i].pause();
    })
 }
}

