

function deleteComment(element) {

    const commentID = element.id;
    const path = window.location.pathname + '/delete-comment/' + commentID;
  
    const comment = element.parentElement;
  
    fetch( path, {method: 'POST'})
    .then( response =>  {
      if(response.ok) {
  
        //WE THEN NEED TO REMOVE THE COMMENT FROM THE PAGE!!
        comment.parentElement.removeChild(comment);
        alert("Comment successfully deleted");
        return;
      }
      throw new Error('Request failed.');
    })
    .catch(function(error) {
      console.log(error);
    });
}


function deleteVideo(element) {

  const id = element.id;  
  const path = window.location.pathname + '/delete-video/' + id;
  video = element.parentElement;


  fetch( path, {method: 'POST'})
  .then( response =>  {
    if(response.ok) {

      //WE THEN NEED TO REMOVE THE COMMENT FROM THE PAGE!!
      video.parentElement.removeChild(video);
      alert("Video successfully deleted");
      return;
    }
    throw new Error('Request failed.');
  })
  .catch(function(error) {
    console.log(error);
  });
}