// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener('resume', onResume.bind(this), false);
        // Set the status background
        StatusBar.backgroundColorByHexString("#d44e00")

        var user = window.localStorage.getItem("user");
        if (user == null) {
            console.log('user doesnt exist...')
            if (window.location.href.indexOf("login") == -1)
                window.location = "login.html"
        } else {
            console.log('user exist...')
            if (window.location.href.indexOf("starter") == -1)
                window.location = "starter.html"
        }
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };
    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };
} )();