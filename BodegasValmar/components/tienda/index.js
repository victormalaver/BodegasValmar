'use strict';

app.tienda = kendo.observable({
    dataInit: function () {},
    onShow: function () {},
    afterShow: function () {}
});

// START_CUSTOM_CODE_tienda
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_tienda
(function (parent) {
    var dataProvider = app.data.bodegas,
        fetchFilteredData = function (paramFilter, searchFilter) {
            var model = parent.get('tiendaModel');
            var dataSource = model.get('dataSource');

            if (paramFilter) {
                model.set('paramFilter', paramFilter);
            } else {
                model.set('paramFilter', undefined);
            }

            if (paramFilter && searchFilter) {
                dataSource.filter({
                    logic: 'and',
                    filters: [paramFilter, searchFilter]
                });
            } else if (paramFilter || searchFilter) {
                dataSource.filter(paramFilter || searchFilter);
            } else {
                dataSource.filter({});
            }
        },
        processImage = function (img) {

            function isAbsolute(img) {
                if  (img && (img.slice(0,  5)  ===  'http:' || img.slice(0,  6)  ===  'https:' || img.slice(0,  2)  ===  '//'  ||  img.slice(0,  5)  ===  'data:')) {
                    return true;
                }
                return false;
            }

            if (!img) {
                var empty1x1png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=';
                img = 'data:image/png;base64,' + empty1x1png;
            } else if (!isAbsolute(img)) {
                var setup = dataProvider.setup || {};
                img = setup.scheme + ':' + setup.url + setup.appId + '/Files/' + img + '/Download';
            }

            return img;
        },
        flattenLocationProperties = function (dataItem) {
            var propName, propValue,
                isLocation = function (value) {
                    return propValue && typeof propValue === 'object' &&
                        propValue.longitude && propValue.latitude;
                };

            for (propName in dataItem) {
                if (dataItem.hasOwnProperty(propName)) {
                    propValue = dataItem[propName];
                    if (isLocation(propValue)) {
                        dataItem[propName] =
                            kendo.format('Latitude: {0}, Longitude: {1}',
                                propValue.latitude, propValue.longitude);
                    }
                }
            }
        },
        dataSourceOptions = {
            type: 'everlive',
            transport: {
                // read: function (options) {
                //     /* implementation omitted for brevity */
                //     var settings = {
                //         "async": true,
                //         "crossDomain": true,
                //         "url": servidor + "tienda/listarPorDistrito?id=" + $("#campo").val(),
                //         "method": "GET",
                //         "headers": {
                //             "token": token,
                //             "cache-control": "no-cache"
                //         }
                //     }
                //     $.ajax(settings).done(function (result) {
                //         options.success(result);
                //     });
                // }
                read: {
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('token', token)
                    }
                }
            },
            change: function (e) {
                var data = this.data();
                for (var i = 0; i < data.length; i++) {
                    var dataItem = data[i];

                    dataItem['imagenUrl'] =
                        processImage(dataItem['imagen']);

                    flattenLocationProperties(dataItem);
                }
            },
            error: function (e) {

                if (e.xhr) {
                    alert(JSON.stringify(e.xhr));
                }
            },
            schema: {
                model: {
                    fields: {
                        'nombre': {
                            field: 'nombre',
                            defaultValue: ''
                        },
                        'imagen': {
                            field: 'imagen',
                            defaultValue: ''
                        },
                    }
                }
            },
            serverFiltering: true,
            serverSorting: true,
            serverPaging: true,
            pageSize: 50
        },
        dataSource = new kendo.data.DataSource(dataSourceOptions),
        tiendaModel = kendo.observable({
            dataSource: dataSource,
            searchChange: function (e) {
                var searchVal = e.target.value,
                    searchFilter;
                if (searchVal) {
                    searchFilter = {
                        field: 'nombre',
                        operator: 'contains',
                        value: searchVal
                    };
                }
                fetchFilteredData(tiendaModel.get('paramFilter'), searchFilter);
            },
            fixHierarchicalData: function (data) {
                var result = {},
                    layout = {};

                $.extend(true, result, data);

                (function removeNulls(obj) {
                    var i, name,
                        names = Object.getOwnPropertyNames(obj);

                    for (i = 0; i < names.length; i++) {
                        name = names[i];

                        if (obj[name] === null) {
                            delete obj[name];
                        } else if ($.type(obj[name]) === 'object') {
                            removeNulls(obj[name]);
                        }
                    }
                })(result);

                (function fix(source, layout) {
                    var i, j, name, srcObj, ltObj, type,
                        names = Object.getOwnPropertyNames(layout);

                    for (i = 0; i < names.length; i++) {
                        name = names[i];
                        srcObj = source[name];
                        ltObj = layout[name];
                        type = $.type(srcObj);

                        if (type === 'undefined' || type === 'null') {
                            source[name] = ltObj;
                        } else {
                            if (srcObj.length > 0) {
                                for (j = 0; j < srcObj.length; j++) {
                                    fix(srcObj[j], ltObj[0]);
                                }
                            } else {
                                fix(srcObj, ltObj);
                            }
                        }
                    }
                })(result, layout);

                return result;
            },
            itemClick: function (e) {
                var dataItem = e.dataItem || tiendaModel.originalItem;
                app.mobileApp.navigate('#components/tienda/details.html?id=' + dataItem.uid);
            },
            detailsShowPorId: function (id) {
                tiendaModel.setCurrentItemByUidNombre(id);
            },
            setCurrentItemByUidNombre: function (e) {
                var item = e.view.params.id;
                var settings = {
                    "async": true,
                    "crossDomain": true,
                    "url": servidor + "tienda/obtenerPorId?id=" + item,
                    "method": "GET",
                    "headers": {
                        "token": token,
                        "cache-control": "no-cache"
                    }
                }
                $.ajax(settings).done(function (itemModel) {
                    itemModel.imagenUrl = "styles/img/ic-img-listadobodegas.jpg";
                    itemModel.direccion = itemModel.direcciones[0].domicilio + " " + itemModel.direcciones[0].numero + itemModel.direcciones[0].distrito.nombre;
                    tiendaModel.set('originalItem', itemModel);
                    tiendaModel.set('currentItem', tiendaModel.fixHierarchicalData(itemModel));
                    return itemModel;
                });
            },
            detailsShow: function (e) {
                tiendaModel.setCurrentItemByUid(e.view.params.id);
                $("#tiendaModelDetailsView .details-content").css("display", "block");
            },
            setCurrentItemByUid: function (id) {
                var item = id,
                    dataSource = tiendaModel.get('dataSource'),
                    itemModel = dataSource.getByUid(item);

                if (!itemModel.nombre) {
                    itemModel.nombre = String.fromCharCode(160);
                }

                itemModel.imagenUrl = "styles/img/ic-img-listadobodegas.jpg";
                itemModel.direccion = itemModel.direcciones[0].domicilio + " " + itemModel.direcciones[0].numero + itemModel.direcciones[0].distrito.nombre;

                tiendaModel.set('originalItem', itemModel);
                tiendaModel.set('currentItem',
                    tiendaModel.fixHierarchicalData(itemModel));

                return itemModel;
            },
            linkBind: function (linkString) {
                var linkChunks = linkString.split('|');
                if (linkChunks[0].length === 0) {
                    return this.get("currentItem." + linkChunks[1]);
                }
                return linkChunks[0] + this.get("currentItem." + linkChunks[1]);
            },
            imageBind: function (imageField) {
                if (imageField.indexOf("|") > -1) {
                    return processImage(this.get("currentItem." + imageField.split("|")[0]));
                }
                return processImage(imageField);
            },
            aceptarModalviewAlert: function () {
                closeModal('modalview-alert');
            },
            verListaTienda: function () {
                $("#verMapaBodega").removeClass("primary");
                $("#verListaBodega").addClass("primary");
                $("#mapSeguimiento").css("display", "none");
                $("#mapSeguimiento").html("");
            },
            verListaTiendaDetalle: function () {
                $("#verMapaBodegaDetalle").removeClass("primary");
                $("#verListaBodegaDetalle").addClass("primary");
                $("#mapSeguimientoDetalle").css("display", "none");
                $("#mapSeguimientoDetalle").html("");
                $("#tiendaModelDetailsView .details-content").css("display", "block");
            },
            verMapaTienda: function (e) {
                var miLatLong = [];
                var miArgument = [];
                var miGPS = navigator.geolocation.getCurrentPosition(function (position) {
                        miLatLong = [parseFloat(position.coords.latitude), parseFloat(position.coords.longitude)];
                        miArgument = 'Latitude: ' + position.coords.latitude + '<br />' +
                            'Longitude: ' + position.coords.longitude + '<br />' +
                            'Altitude: ' + position.coords.altitude + '<br />' +
                            'Accuracy: ' + position.coords.accuracy + '<br />' +
                            'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '<br />' +
                            'Heading: ' + position.coords.heading + '<br />' +
                            'Speed: ' + position.coords.speed + '<br />' +
                            'Timestamp: ' + position.timestamp + '<br />';
                        if (miLatLong.length > 0) {
                            cargaPosAlmacenesDespachador(dataSource, miLatLong, miArgument, "");
                            $("#verMapaBodega").addClass("primary");
                            $("#verListaBodega").removeClass("primary");
                        } else {
                            alert("Error");
                        }
                    },
                    function (error) {
                        alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
                    });

                if (!miGPS) {
                    $("#contentAlertHome").html("Encienda su GPS para poder ver el mapa");
                    openModal('modalview-alert-home');
                }
            },
            verMapaTiendaDetalle: function (e) {
                var miLatLong = [];
                var miArgument = [];
                var miGPS = navigator.geolocation.getCurrentPosition(function (position) {
                        miLatLong = [parseFloat(position.coords.latitude), parseFloat(position.coords.longitude)];
                        miArgument = 'Latitude: ' + position.coords.latitude + '<br />' +
                            'Longitude: ' + position.coords.longitude + '<br />' +
                            'Altitude: ' + position.coords.altitude + '<br />' +
                            'Accuracy: ' + position.coords.accuracy + '<br />' +
                            'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '<br />' +
                            'Heading: ' + position.coords.heading + '<br />' +
                            'Speed: ' + position.coords.speed + '<br />' +
                            'Timestamp: ' + position.timestamp + '<br />';
                        if (miLatLong.length > 0) {
                            $("#tiendaModelDetailsView .details-content").css("display", "none");
                            cargaPosAlmacenesDespachador(dataSource, miLatLong, miArgument, "Detalle");
                        } else {
                            alert("csm");
                        }
                    },
                    function (error) {
                        alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
                    });
                if (!miGPS) {
                    $("#contentAlertHome").html("Encienda su GPS para poder ver el mapa");
                    openModal('modalview-alert-home');
                }
            },
            currentItem: {}
        }),
        cargaPosAlmacenesDespachador = function (dataSource, miLatLong, miArgument, detalle) {

            $("#mapSeguimiento" + detalle).remove();
            var alto = $(window).height() - $("#headerSeguimiento").height();
            var div = $("<div id='mapSeguimiento" + detalle + "' style='width:100%;height:" + alto + "px;' ></div>").text("");
            $("#divMapSeguimiento" + detalle).after(div);

            //<![CDATA[
            // var restLatLong = [-12.105753065958925, -77.03500092029572];
            var iconMiUbicacion = L.icon({
                iconUrl: 'Mapa/images/marker-icon.png', //iconUrl: 'Mapa/images/markerEntregados.png',
                // iconRetinaUrl: 'Mapa/images/marker-icon-2x.png',
                // iconSize: [38, 95], 
                iconAnchor: [15, 38], //X,Y
                popupAnchor: [0, -35],
                shadowUrl: 'Mapa/images/marker-shadow.png',
                // shadowRetinaUrl: 'my-icon-shadow@2x.png',
                // shadowSize: [68, 95],
                // shadowAnchor: [22, 94]
            });

            var iconSeguimiento = L.icon({
                iconUrl: 'Mapa/images/ic-pinbodega.png',
                // iconRetinaUrl: 'my-icon@2x.png',
                // iconSize: [38, 95],
                iconAnchor: [15, 38], //X,Y
                popupAnchor: [0, -35],
                // // shadowUrl: 'my-icon-shadow.png',
                // shadowRetinaUrl: 'my-icon-shadow@2x.png',
                // shadowSize: [68, 95],
                // shadowAnchor: [22, 94]
            });



            var map = new L.map('mapSeguimiento' + detalle, {
                center: miLatLong,
                zoom: 15,
            });
            L.tileLayer('http://{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png', {
                //attribution: "Map: Tiles Courtesy of MapQuest (OpenStreetMap, CC-BY-SA)",
                subdomains: ["otile1", "otile2", "otile3", "otile4"],
                // maxZoom: 12,
                // minZoom: 2
            }).addTo(map);

            var miUbicacion = new L.MarkerClusterGroup();
            var markerClientes = new L.MarkerClusterGroup();
            //markers.addLayer(new L.Marker([1, 1]));


            miUbicacion.addTo(map);
            markerClientes.addTo(map);


            miUbicacion.addLayer(new L.Marker(miLatLong, {
                icon: iconMiUbicacion
            }).bindPopup("<b>Mi pedido está aquí:</b></br>" + miArgument));


            var ubicSeguimientos = "";

            dataSource.fetch(function () {
                for (var i = 0; i < dataSource.total(); i++) { //cantidad de órdenes del cliente
                    if (dataSource.at(i).direcciones) {
                        // var pedido = [];
                        for (var j = 0; j < dataSource.at(i).direcciones.length; j++) {
                            // pedido.push("</br>" + dataSource.at(i).direcciones[j] + " + " + dataSource.at(i).direcciones[j]);
                            ubicSeguimientos = dataSource.at(i).direcciones[j].latitud + dataSource.at(i).direcciones[j].longitud; //[43.465187, -80.52237200000002];
                            var seguimientoLatLong = [parseFloat(dataSource.at(i).direcciones[j].latitud), parseFloat(dataSource.at(i).direcciones[j].longitud)];
                            markerClientes.addLayer(new L.Marker(seguimientoLatLong, {
                                icon: iconSeguimiento
                            }).bindPopup("<big>" + dataSource.at(i).nombre + "</big></br><b><em>" + dataSource.at(i).estado + "</em></b>"));

                            if (detalle == "Detalle") {
                                map.panTo(new L.LatLng(parseFloat(dataSource.at(i).direcciones[j].latitud), parseFloat(dataSource.at(i).direcciones[j].longitud)));
                            }

                            // map.setView(new L.LatLng(40.737, -73.923), 8);
                        }
                    }
                }

            });
        };

    // if (typeof dataProvider.sbProviderReady === 'function') {
    //     dataProvider.sbProviderReady(function dl_sbProviderReady() {
    //         parent.set('tiendaModel', tiendaModel);
    //     });
    // } else {
    parent.set('tiendaModel', tiendaModel);
    // }

    parent.set('onShow', function (e) {
        dataSource.transport.options.read.url = servidor + "tienda/listarPorDistrito?id=" + $("#distrito-select-filtro option:selected").val();

        var param = e.view.params.filter ? JSON.parse(e.view.params.filter) : null,
            isListmenu = false,
            backbutton = e.view.element && e.view.element.find('header [data-role="navbar"] .backButtonWrapper');

        if (param || isListmenu) {
            backbutton.show();
            backbutton.css('visibility', 'visible');
        } else {
            if (e.view.element.find('header [data-role="navbar"] [data-role="button"]').length) {
                backbutton.hide();
            } else {
                backbutton.css('visibility', 'hidden');
            }
        }

        fetchFilteredData(param);
    });

})(app.tienda);

// START_CUSTOM_CODE_tiendaModel
// Add custom code here. For more information about custom code, see http://docs.telerik.com/platform/screenbuilder/troubleshooting/how-to-keep-custom-code-changes

// END_CUSTOM_CODE_tiendaModel