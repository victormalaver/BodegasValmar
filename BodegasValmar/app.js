'use strict';

var servidor = "http://190.237.15.180:201/ecommerce/";
var idUsuario = "";
var token = "";

(function () {
    var app = {
        data: {}
    };

    var bootstrap = function () {
        $(function () {
            app.mobileApp = new kendo.mobile.Application(document.body, {
                skin: 'nova',
                initial: 'components/login/view.html'
            });
            /*navegación personalizada*/
            $('div[class^=square-]').click(function (e) {
                var link = e.currentTarget.dataset.link;
                if (link) {
                    app.mobileApp.navigate(link);
                }
                if (link == "components/login/view.html") {
                    idUsuario = "";
                    token = "";
                }
            });
            $('div.drawerHeader').click(function (e) {
                var link = e.currentTarget.dataset.link;
                app.mobileApp.navigate(link);
            });
            /**/
        });
    };

    if (window.cordova) {
        document.addEventListener('deviceready', function () {
            if (navigator && navigator.splashscreen) {
                navigator.splashscreen.hide();
            }

            var element = document.getElementById('appDrawer');
            if (typeof (element) != 'undefined' && element !== null) {
                if (window.navigator.msPointerEnabled) {
                    $('#navigation-container').on('MSPointerDown', 'a', function (event) {
                        app.keepActiveState($(this));
                    });
                } else {
                    $('#navigation-container').on('touchstart', 'a', function (event) {
                        app.keepActiveState($(this).closest('li'));
                    });
                }
            }

            bootstrap();
        }, false);
    } else {
        bootstrap();
    }

    app.keepActiveState = function _keepActiveState(item) {
        var currentItem = item;
        $('#navigation-container li.active').removeClass('active');
        currentItem.addClass('active');
    };

    window.app = app;

    app.isOnline = function () {
        if (!navigator || !navigator.connection) {
            return true;
        } else {
            return navigator.connection.type !== 'none';
        }
    };

    app.openLink = function (url) {
        if (url.substring(0, 4) === 'geo:' && device.platform === 'iOS') {
            url = 'http://maps.apple.com/?ll=' + url.substring(4, url.length);
        }

        window.open(url, '_system');
        if (window.event) {
            window.event.preventDefault && window.event.preventDefault();
            window.event.returnValue = false;
        }
    };

}());


function closeModal(modal) {
    // $("#" + modal + " .primary.km-widget.km-button").removeAttr("onclick");
    $("#" + modal).kendoMobileModalView("close");
}

function openModal(modal) {
    var mv = $("#" + modal).data("kendoMobileModalView");
    mv.shim.popup.options.animation.open.effects = "zoom";
    mv.open();
    // setTimeout($("#" + modal + " .primary.km-widget.km-button").attr("onclick", "closeModal('" + modal + "')"), 1500);
}