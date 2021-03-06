'use strict';

app.filtro = kendo.observable({
    dataInit: function () {
        kendo.mobile.application.showLoading();
        $("#btn-modalview-alert").removeAttr("onclick");
        //CARGAR DEPARTAMENTOS
        var data;
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": servidor + "departamento/listar",
            "method": "GET",
            "headers": {
                "token": token,
                "cache-control": "no-cache"
            }
        }

        $.ajax(settings).done(function (data) {
            var html = [];
            for (var i = 0; i < data.length; i++) {
                html.push('<option value="' + data[i].id + '">' + data[i].nombre + '</option>');
            }
            $("#departamento-select-filtro").html(html);
            $("#departamento-select-filtro").val(15);
            app.filtro.getProvincias();
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
    },
    getProvincias: function () {
        kendo.mobile.application.showLoading();
        $("#btn-modalview-alert").removeAttr("onclick");
        //CARGAR PROVINCIAS

        var settings = {
            "async": true,
            "crossDomain": true,
            "url": servidor + "provincia/listarPorDepartamento?id=" + $("#departamento-select-filtro").val(),
            "method": "GET",
            "headers": {
                "token": token,
                "cache-control": "no-cache"
            }
        }
        $.ajax(settings).done(function (data) {

            var html = [];
            for (var i = 0; i < data.length; i++) {
                html.push('<option value="' + data[i].id + '">' + data[i].nombre + '</option>');
            }
            $("#provincia-select-filtro").html(html);
            app.filtro.getDistritos();

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
    },
    getDistritos: function () {
        kendo.mobile.application.showLoading();
        //CARGAR DISTRITOS
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": servidor + "distrito/listarPorProvincia?id=" + $("#provincia-select-filtro").val(),
            "method": "GET",
            "headers": {
                "token": token,
                "cache-control": "no-cache"
            }
        }

        $.ajax(settings).done(function (data) {
            var html = [];
            for (var i = 0; i < data.length; i++) {
                html.push('<option value="' + data[i].id + '">' + data[i].nombre + '</option>');
            }
            $("#distrito-select-filtro").html(html);
            $("#btn-modalview-alert").attr("onclick", "openModal('modalview-alert')");
            kendo.mobile.application.hideLoading();
        }).fail(function (response) {
            kendo.mobile.application.hideLoading();
            $("#btn-modalview-alert").attr("onclick", "openModal('modalview-alert')");
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

    },
    getTiendaByname: function () {
        if ($("#searchTienda").val().length < 4) {
            $("#listadoTiendasAutocomplete").css("display", "none");
            $(".divSelects").css("display", "block");
            return;
        } else {
            $("#listadoTiendasAutocomplete").css("display", "block");
            $(".divSelects").css("display", "none");
        }
        // kendo.mobile.application.showLoading();
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": servidor + "tienda/obtenerTiendasPorNombre?nombre=" + $("#searchTienda").val(),
            "method": "GET",
            "headers": {
                "token": token,
                "cache-control": "no-cache"
            }
        }

        $.ajax(settings).done(function (data) {
            var html = [];
            for (var i = 0; i < data.length; i++) {
                html.push('<li onclick="app.filtro.goToTiendaById(' + data[i].id + ');"><p>' + data[i].nombre.toLowerCase().replace(document.getElementById("searchTienda").value.toLowerCase(), "<strong>" + document.getElementById("searchTienda").value.toLowerCase() + "</strong>") + '</p><h5>' + data[i].domicilio + " " + data[i].numero + ", " + data[i].distrito + '</h5></li>');
            }
            if (data.length == 0) {
                html.push('<li onclick="app.filtro.goToTiendaById(' + data[0].id + ');"><p>' + data[0].nombre.toLowerCase().replace(document.getElementById("searchTienda").value.toLowerCase(), "<strong>" + document.getElementById("searchTienda").value.toLowerCase() + "</strong>") + '</p><h5>' + data[0].domicilio + " " + data[0].numero + ", " + data[0].distrito + '</h5></li>');
            }
            $("#listadoTiendasAutocomplete").html(html);
            // kendo.mobile.application.hideLoading();
        }).fail(function (response) {
            // kendo.mobile.application.hideLoading();
            // $("#btn-modalview-alert").attr("onclick", "openModal('modalview-alert')");
            // switch (response.status) {
            //     case 404:
            //         // No existe el servicio
            //         $("#contentAlertHome").html("El servicio no está disponible");
            //         $("#emailLogin").parent().addClass("error");
            //         openModal('modalview-alert-home');
            //         return false;
            //         break;
            //     default:
            //         // No existe el servicio
            //         $("#contentAlertHome").html("Error en el servicio");
            //         $("#emailLogin").parent().addClass("error");
            //         openModal('modalview-alert-home');
            //         return false;
            //         break;
            // }
        });

    },
    goToTiendaById: function (id) {
        app.mobileApp.navigate('components/tienda/detallePorId.html?id=' + id);
    },
    goToTiendaByDistrito: function (e) {
        // kendo.mobile.application.showLoading();
        // var settings = {
        //     "async": true,
        //     "crossDomain": true,
        //     "url": servidor + "tienda/listarPorDistrito?id=" + $("#distrito-select-filtro option:selected").val(),
        //     "method": "GET",
        //     "headers": {
        //         "token": token,
        //         "cache-control": "no-cache"
        //     }
        // }
        // $.ajax(settings).done(function (data) {
        //     kendo.mobile.application.hideLoading();
        //     if (data) {
                app.mobileApp.navigate('components/tienda/view.html');
        //     } else {
        //         $("#contentAlertHome").html("No existen bodegas en el distrito");
        //         openModal('modalview-alert-home');
        //     }
        // }).fail(function (response) {
        //     kendo.mobile.application.hideLoading();
        //     switch (response.status) {
        //         case 404:
        //             // No existe el servicio
        //             $("#contentAlertHome").html("El servicio no está disponible");
        //             openModal('modalview-alert-home');
        //             return false;
        //             break;
        //         default:
        //             // No existe el servicio
        //             $("#contentAlertHome").html("Error en el servicio");
        //             openModal('modalview-alert-home');
        //             return false;
        //             break;
        //     }
        // });
    },
    onShow: function () {},
    afterShow: function () {}
});