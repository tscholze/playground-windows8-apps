// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
    "use strict";

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    WinJS.strictProcessing();

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: This application has been newly launched. Initialize
                // your application here.
            } else {
                // TODO: This application has been reactivated from suspension.
                // Restore application state here.
            }

            args.setPromise(WinJS.UI.processAll().done(function () {
                var btn = document.getElementById("changeContentBtn");
                btn.addEventListener("click", btnChangeContent, false);

                document.getElementById("changeClassBtn").addEventListener("click", btnChangeClass, false);
            })
            );

            args.setPromise(WinJS.UI.processAll());
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: This application is about to be suspended. Save any state
        // that needs to persist across suspensions here. You might use the
        // WinJS.Application.sessionState object, which is automatically
        // saved and restored across suspension. If you need to complete an
        // asynchronous operation before your application is suspended, call
        // args.setPromise().
    };

    function btnChangeContent(mouseEvent) {
        var changeContent = document.getElementById("changeContent");
        changeContent.innerText =
            mouseEvent.type
            + ": (" + mouseEvent.clientX + "," + mouseEvent.clientY + ")";
    }

    function btnChangeClass(mouseEvent) {
        changeCssClass();
    }

    function changeCssClass() {
        var changeClass = document.getElementById("changeClass");
        if (changeClass.className == "class1") {
            changeClass.className = "class2";
        } else {
            changeClass.className = "class1";
        }
    }


    app.start();
})();
