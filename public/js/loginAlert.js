let alerting = false;

function removeAlert(elem) {
    $("#alertBackground").remove();
}

//Item is jquery selected
function loginAlert(message) {

  //window.location = "/users/login";
  //return;

  //Make sure if there's an alert open, close it
  $("#alertBackground").remove();

  const html = `
    <div id="alertBackground">
        <div id="loginAlert">
            <h3> ${message} </h3>
            <div id="alertFooter">
                <a href="/users/login"> Log in </a>
                <button onclick="removeAlert(this)"> Close </button>
            </div>
        </div>
    </div>`;
    $("#other-content").append(html);
}