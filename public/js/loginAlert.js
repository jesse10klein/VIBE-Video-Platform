let alerting = false;

function removeAlert(elem) {
    const alert = elem.parentElement.parentElement;
    console.log(alert);
    console.log($(alert));
    $(alert).remove();
    console.log("removed?")
}

//Item is jquery selected
function loginAlert(item, message) {

  window.location = "/users/login";
  return;
  //Make sure if there's an alert open, close it
  $("#loginAlert").remove();

  const html = `
        <div id="loginAlert">
            <h3> ${message} </h3>
            <div id="alertFooter">
                <a href="/users/login"> Log in </a>
                <button onclick="removeAlert(this)"> Close </button>
            </div>
        </div>`

    const node = $($.parseHTML(html));
    item.append(node);
}