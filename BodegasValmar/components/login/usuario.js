'use strict';

app.usuario = kendo.observable({
    onShow: function () {
        if (idUsuario !== "") {
            // ObternetPorID:
            var settings = {
                "async": true,
                "crossDomain": true,
                "url": servidor + "cliente/obtenerPorId?id=" + idUsuario,
                "method": "GET",
                "headers": {
                    "token": token,
                    "cache-control": "no-cache"
                }
            }

            $.ajax(settings).done(function (data) {
                $("#perfilView .li-1 input").val(data.nombre);
                $("#perfilView .li-2 input").val(data.apellido);

                $("#generoUsuario").kendoMobileButtonGroup({
                    select: function (e) {
                        // console.log("selected index:" + e.index);
                    },
                    index: (data.genero == "M" ? 0 : 1)
                });
                $("#perfilView .li-4 input").val(data.correo);
                $("#perfilView .li-5 input").val(data.password);
                $("#perfilView .li-6 input").val(data.password);

                $("#perfilView .li-8").css("display", "block");

                // var html = [];
                // for (var i = 0; i < data.length; i++) {
                //     html.push('<option value="' + data[i].id + '">' + data[i].nombre + '</option>');
                // }
                // $("#departamento-select-filtro").html(html);
                // $("#departamento-select-filtro").val(1);
            }).fail(function (response) {
                kendo.mobile.application.hideLoading();
                switch (response.status) {
                    case 404:
                        // No existe el servicio
                        $("#contentAlertHome").html("El servicio no está disponible");
                        $("#emailLogin").parent().addClass("error");
                        openModal('modalview-alert-home');
                        return false;
                        break;
                    default:
                        // No existe el servicio
                        $("#contentAlertHome").html("Error en el servicio");
                        $("#emailLogin").parent().addClass("error");
                        openModal('modalview-alert-home');
                        return false;
                        break;
                }
            });
            // HttpStatus: 200 OK
            // 404 NOT FOUND
        }
    },
    afterShow: function () {}
});

// START_CUSTOM_CODE_usuario
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_usuario
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
                model = parent.usuarioModel;

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
                model = parent.usuarioModel || {},
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
        usuarioModel = kendo.observable({
            displayName: '',
            apellido: '',
            genero: '',
            email: '',
            password: '',
            password2: '',
            validateData: function () {
                var valido = true;
                $("#usuarioView [class^='li-'] input").removeClass("error");

                if (!$("#usuarioView .li-1 input").val()) {
                    $("#usuarioView .li-1 input").addClass("error");
                    // alert('Ingrese sus nombres');
                    valido = false;
                }

                if (!$("#usuarioView .li-2 input").val()) {
                    $("#usuarioView .li-2 input").addClass("error");
                    // alert('Ingrese sus apellidos');
                    valido = false;
                }

                if (!$("#usuarioView .li-4 input").val()) {
                    $("#usuarioView .li-4 input").addClass("error");
                    // alert('Ingrese un correo de contacto');
                    valido = false;
                }

                var testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;
                if (testEmail.test($("#usuarioView .li-4 input").val())) {
                    $("#usuarioView .li-4 input").removeClass("error");
                } else {
                    $("#usuarioView .li-4 input").addClass("error");
                    // alert('Ingrese un correo válido');
                    valido = false;
                }

                if (!$("#generoUsuario .km-state-active .km-text").text()) {
                    $("#generoUsuario").addClass("error");
                    // alert('Seleccione su genero');
                    valido = false;
                }

                if (!$("#usuarioView .li-5 input").val()) {
                    $("#usuarioView .li-5 input").addClass("error");
                    // alert('Error: Ingrese primera contraseña');
                    valido = false;
                }
                if (!$("#usuarioView .li-6 input").val()) {
                    $("#usuarioView .li-6 input").addClass("error");
                    // alert('Error: Ingrese segunda contraseña');
                    valido = false;
                }

                if ($("#usuarioView .li-5 input").val() !== $("#usuarioView .li-6 input").val()) {
                    $("#usuarioView .li-5 input").addClass("error");
                    $("#usuarioView .li-6 input").addClass("error");
                    // alert('Error: Contraseñas distintas');
                    valido = false;
                }

                return valido;
            },
            register: function () {
                var model = usuarioModel;
                if (!model.validateData(model)) {
                    return false;
                }
                kendo.mobile.application.showLoading();
                var data = {
                    "nombre": $("#usuarioView .li-1 input").val(),
                    "apellido": $("#usuarioView .li-2 input").val(),
                    "correo": $("#usuarioView .li-4 input").val(),
                    "password": $("#usuarioView .li-5 input").val(),
                    "password2": $("#usuarioView .li-6 input").val(),
                    "genero": $("#generoUsuario .km-state-active .km-text").text() == "Mujer" ? "F" : "M",
                };
                var settings = {
                    "async": true,
                    "crossDomain": true,
                    "url": "http://192.168.1.201:8080/ecommerce/cliente/agregar",
                    "method": "POST",
                    "headers": {
                        "token": "dest47t7j73mh0turlfk3j3sdc",
                        "content-type": "application/json",
                        "cache-control": "no-cache"
                    },
                    "processData": false,
                    "data": JSON.stringify(data)
                }

                $.ajax(settings).done(function (response) {
                    kendo.mobile.application.hideLoading();
                    app.mobileApp.navigate('components/login/view.html');
                    $("#contentAlertHome").html("Se registró correctamente. Inicie sesión con su correo y contraseña");
                    openModal('modalview-alert-home');
                }).fail(function (response) {
                    kendo.mobile.application.hideLoading();
                    switch (response.status) {
                        case 404:
                            // No existe el servicio
                            $("#contentAlertHome").html("El servicio no está disponible");
                            openModal('modalview-alert-home');
                            return false;
                            break;
                        case 409:
                            // No existe el servicio
                            $("#contentAlertHome").html("El correo ya está registrado");
                            $("#usuarioView .li-4 input").addClass("error");
                            openModal('modalview-alert-home');
                            return false;
                            break;
                        case 408:
                            $("#contentAlertHome").html("Error: El servicio no responde");
                            openModal('modalview-alert-home');
                            return false;
                            break;
                        case 500:
                            $("#contentAlertHome").html("Error interno del servidor");
                            openModal('modalview-alert-home');
                            return false;
                            break;
                        default:
                            // No existe el servicio
                            $("#contentAlertHome").html("Error");
                            openModal('modalview-alert-home');
                            return false;
                            break;
                    }
                });
                // HttpStatus: 201 Created
                // 409 Conlfict



                // provider.Users.register(email, password, attrs, successHandler, init);
            },
            updateUsuario: function () {
                // Actualizar USUARIO:
                var data = {
                    "id": idUsuario,
                    "nombre": $("#usuarioView .li-1 input").val(),
                    "apellido": $("#usuarioView .li-2 input").val(),
                    "correo": $("#usuarioView .li-4 input").val(),
                    "password": $("#usuarioView .li-5 input").val(),
                    "password2": $("#usuarioView .li-6 input").val(),
                    "genero": $("#generoUsuario .km-state-active .km-text").text() == "Mujer" ? "F" : "M",
                };
                var model = usuarioModel;
                if (!model.validateData(data)) {
                    return false;
                }
                kendo.mobile.application.showLoading();
                var settings = {
                    "async": true,
                    "crossDomain": true,
                    "url": servidor + "cliente/actualizar",
                    "method": "PUT",
                    "headers": {
                        "content-type": "application/json",
                        "token": "bndul7rr0eqfnd8fhech90p4h1",
                        "cache-control": "no-cache",
                        "postman-token": "df004a04-c2e2-ccc5-2f9d-5a4761502ef3"
                    },
                    "processData": false,
                    "data": JSON.stringify(data)
                }
                $.ajax(settings).done(function (data) {
                    kendo.mobile.application.hideLoading();
                    $("#contentAlertHome").html("Datos actualizados correctamente");
                    openModal('modalview-alert-home');
                    $("#drawerUsername").text($("#usuarioView .li-1 input").val());
                }).fail(function (response) {
                    kendo.mobile.application.hideLoading();
                    switch (response.status) {
                        case 404:
                            // No existe el servicio
                            $("#contentAlertHome").html("El servicio no está disponible");
                            $("#emailLogin").parent().addClass("error");
                            openModal('modalview-alert-home');
                            return false;
                            break;
                        default:
                            // No existe el servicio
                            $("#contentAlertHome").html("Error en el servicio");
                            $("#emailLogin").parent().addClass("error");
                            openModal('modalview-alert-home');
                            return false;
                            break;
                    }
                });
                // HttpStatus: 200 OK
                // 404 NOT FOUND
            },
            toggleView: function () {
                mode = mode === 'signin' ? 'register' : 'signin';
                init();
            }
        });

    parent.set('usuarioModel', usuarioModel);
    parent.set('afterShow', function (e) {
        if (e && e.view && e.view.params && e.view.params.logout) {
            usuarioModel.set('logout', true);
        }
        // provider.Users.currentUser().then(successHandler, init);
    });
})(app.usuario);

// START_CUSTOM_CODE_usuarioModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_usuarioModel