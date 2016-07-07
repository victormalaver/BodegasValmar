'use strict';

app.login = kendo.observable({
    onShow: function () {
        var h = $(window).height();
        var w = $("#appDrawer").width();
        $(".imgperfil").height(h - (3 * w / 2));
        $("div[class^='square']").height(w / 2);
    },
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
                // if (!data.email) {
                //     alert('Missing email');
                //     return false;
                // }
                // if (!data.password) {
                //     alert('Missing password');
                //     return false;
                // }
                $("#loginView [class^='li-'] input").removeClass("error");
                if (!$("#loginView .li-1 input").val()) {
                    $("#loginView .li-1 input").addClass("error");
                    // alert('Ingrese su correo');
                    return false;
                }
                if (!$("#loginView .li-2 input").val()) {
                    $("#loginView .li-2 input").addClass("error");
                    // alert('Ingrese su contraseña');
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
                        kendo.mobile.application.hideLoading();
                        $("#emailLogin, #passLogin").parent().removeClass("error");
                        switch (datos.status) {
                            case 401:
                                // No autorizado
                                $("#loginView .li-2 input").addClass("error");
                                $("#contentAlertHome").html("Ingrese la contraseña correcta");
                                $("#passLogin").parent().addClass("error");
                                openModal('modalview-alert-home');
                                return false;
                                break;
                            case 404:
                                // No existe el usuario
                                $("#contentAlertHome").html("Usuario no registrado");
                                $("#loginView .li-1 input").addClass("error");
                                openModal('modalview-alert-home');
                                return false;
                                break;
                            case 204:
                                // No existe el usuario
                                $("#contentAlertHome").html("Usuario no registrado");
                                $("#loginView .li-1 input").addClass("error");
                                openModal('modalview-alert-home');
                                return false;
                                break;
                            case 500:
                                $("#contentAlertHome").html("Error interno del servidor");
                                openModal('modalview-alert-home');
                                return false;
                                break;
                            case 200:
                                var data = JSON.parse(datos.responseText);
                                idUsuario = data.idUsuario;
                                token = data.token;
                                $("#drawerUsername").text(data.nombre);
                                app.mobileApp.navigate('components/bienvenida/view.html');
                                // $("#liInicio").css("display", "none");
                                // $("#liCerrarSesion").css("display", "block");
                                // $("#liExposiciones").css("border-bottom", "");
                                $("#divNombreUsuario").html(data.nombre);
                                $("#usuarioDivDrag").css("display", "block");
                                break;
                            default:
                                // Sin internet
                                $("#contentAlertHome").html("Error en la conexión de datos");
                                openModal('modalview-alert-home');
                                return false;
                                break;
                        }
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
        if (e && e.view && e.view.params && e.view.params.logout) {
            loginModel.set('logout', true);
        }
        // provider.Users.currentUser().then(successHandler, init);
    });
})(app.login);

// START_CUSTOM_CODE_loginModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_loginModel