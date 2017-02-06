function loadingStatus(bool) {
    if (bool) {
        $(".ui-loader").loader("show", {
            text: "Loading...",
            textVisible: true,
            theme: "b",
            html: ""
        });
    } else {
        $(".ui-loader").loader("hide");
    }
}
function login() {
    loadingStatus(true);
    var data = {
        email: $('#email').val(),
        password: $('#password').val()
    };
    $.post("http://actionnews.1touch.my/mobile/api/login", data)
        .success(
        function (d) {
            if (d != null) {
                window.localStorage.setItem('user', JSON.stringify(data));
                window.location = "starter.html";
            } else
                alert("Login faild...")
        })
        .error(function (e) {
            console.log(e)
            alert(e.responseJSON.error)
            
        })
        .complete(function () { loadingStatus(false) });
}
function logout() {
    window.localStorage.removeItem("user");
    if (window.location.href.indexOf("login") == -1)
        window.location = "login.html"
}