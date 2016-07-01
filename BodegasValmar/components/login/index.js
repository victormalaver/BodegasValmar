'use strict';

app.login = kendo.observable({
    onShow: function () {},
    afterShow: function () {}
});

// START_CUSTOM_CODE_login
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_login
(function (parent) {
    var provider = app.data.bodegas,
        mode = 'signin',
        registerRedirect = 'producto',
        signinRedirect = 'producto',
        init = function (error) {
            if (error) {
                if (error.message) {
                    alert(error.message);
                }
                return false;
            }

            var activeView = mode === 'signin' ? '.signin-view' : '.signup-view',
                model = parent.loginModel;

            if (provider.setup && provider.setup.offlineStorage && !app.isOnline()) {
                $('.offline').show().siblings().hide();
            } else {
                $(activeView).show().siblings().hide();
            }

            if (model && model.set) {
                model.set('logout', null);
            }

        },
        successHandler = function (data) {
            var redirect = mode === 'signin' ? signinRedirect : registerRedirect,
                model = parent.loginModel || {},
                logout = model.logout;

            if (logout) {
                model.set('logout', null);
            }
            if (data && data.result) {
                if (logout) {
                    provider.Users.logout(init, init);
                    return;
                }
                app.user = data.result;

                setTimeout(function () {
                    app.mobileApp.navigate('components/' + redirect + '/view.html');
                }, 0);
            } else {
                init();
            }
        },
        loginModel = kendo.observable({
            displayName: '',
            email: '',
            password: '',
            validateData: function (data) {
                if (!data.email) {
                    alert('Missing email');
                    return false;
                }

                if (!data.password) {
                    alert('Missing password');
                    return false;
                }

                return true;
            },
            signin: function () {
                var model = loginModel,
                    email = model.email.toLowerCase(),
                    password = model.password;

                if (!model.validateData(model)) {
                    return false;
                }
                // provider.Users.login(email, password, successHandler, init);
                $.ajax({
                    url: servidor + 'authenticate',
                    type: 'POST',
                    dataType: 'json',
                    beforeSend: function (xhr) {
                        kendo.mobile.application.showLoading();
                        xhr.setRequestHeader(
                            'Authorization',
                            'Basic ' + btoa(email + ":" + password));
                    },
                    complete: function (datos) {
                        $("#emailLogin, #passLogin").parent().removeClass("error");
                        switch (datos.status) {
                            case 401:
                                // No autorizado
                                $("#contentAlertHome").html("Ingrese la contraseña correcta");
                                $("#passLogin").parent().addClass("error");
                                openModal('modalview-alert-home');
                                return false;
                                break;
                            case 404:
                                // No encontrado
                                $("#contentAlertHome").html("Usuario no registrado");
                                $("#emailLogin").parent().addClass("error");
                                openModal('modalview-alert-home');
                                return false;
                                break;
                            default:
                                break;
                        }
                        var data = JSON.parse(datos.responseText);
                        idUsuario = data.idUsuario;
                        kendo.mobile.application.hideLoading();
                        app.mobileApp.navigate('components/tienda/view.html');
                        $("#liInicio").css("display", "none");
                        $("#liCerrarSesion").css("display", "block");
                        $("#liExposiciones").css("border-bottom", "");

                        $("#divNombreUsuario").html(data.nombre);
                        $("#usuarioDivDrag").css("display", "block");
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        kendo.mobile.application.hideLoading();
                        // $("#emailLogin, #passLogin").parent().addClass("error");
                        // app.mobileApp.navigate('components/home/registro.html');
                    }
                });
            },
            toggleView: function () {
                // mode = mode === 'signin' ? 'register' : 'signin';
                // init();
                app.mobileApp.navigate('components/login/usuario.html');
            }
        });

    parent.set('loginModel', loginModel);
    parent.set('afterShow', function (e) {
/*
        $.ajax({
            url: servidor + 'authenticate',
            type: 'POST',
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader(
                    'Authorization',
                    'Basic ' + btoa("victor.malaver@valmar.com.pe" + ":" + "12345"));
            },
            complete: function (datos) {
                console.log("Autenntttt");
                console.log(datos);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("csm");
                console.log(xhr);
                console.log(ajaxOptions);
                console.log(thrownError);
            }
        });*/

        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://192.168.1.201:8080/ecommerce/distrito/listar",
            "method": "GET",
            "headers": {
                "token": "2ab2lu73n733mq34o8q974l7uq"
            }
        }

        $.ajax(settings).done(function (response) {
            console.log("Listar distritos");
            console.log(response);
        });






        if (e && e.view && e.view.params && e.view.params.logout) {
            loginModel.set('logout', true);
        }
        // provider.Users.currentUser().then(successHandler, init);
    });
})(app.login);

// START_CUSTOM_CODE_loginModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_loginModel