// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

function AgregarOtro(btn) {

    $("#AgregarOtroModal").modal("show");

}

function EditarRegistro(eid, id) {
    $(".btn-close").click(function () {
        $("#EditarRegistroModal").modal("hide");
    });

    $(".close").click(function () {
        $("#EditarRegistroModal").modal("hide");
    });

    $("#IdEntradaRegistro").val(eid);
    $("#IdRegistro").val(id);
    $("#NombreRegistro").val($("td#r-" + id + "-Nombre").attr("data"));
    $("#DiezmoRegistro").val($("td#r-" + id + "-Diezmo").attr("data"));
    $("#MonedaDiezmoRegistro").val($("span#r-" + id + "-MonedaDiezmo").attr("data"));
    $("#OfrendaRegistro").val($("td#r-" + id + "-Ofrenda").attr("data"));
    $("#MonedaOfrendaRegistro").val($("span#r-" + id + "-MonedaOfrenda").attr("data"));

    $("#EditarRegistroModal").modal("show");
}

function RegistrarGasto(rid) {
    $(".btn-close").click(function () {
        $("#RegistrarGastoModal").modal("hide");
    });

    $(".close").click(function () {
        $("#RegistrarGastoModal").modal("hide");
    });

    $("#RegistrarGastoModal").modal("show");
    $("#GastoConcepto").focus();
}

function EditarGasto(gid) {
    $(".btn-close").click(function () {
        $("#EditarGastoModal").modal("hide");
    });

    $(".close").click(function () {
        $("#EditarGastoModal").modal("hide");
    });

    $("#GastoIdEditar").val(gid);
    $("#GastoConceptoEditar").val($("td#g-" + gid + "-Concepto").attr("data"));
    $("#ImporteGastoEditar").val($("td#g-" + gid + "-Importe").attr("data"));
    $("#EditarGastoModal").modal("show");
}

function EliminarGasto(gid) {
    $("#GastoIdEliminar").val(gid);

    if (confirm("Estas seguro que deseas eliminar gasto?")) {
        $("#frmEliminarGasto").submit();
    }
}

function EditarOtro(rid, id) {
    $(".btn-close").click(function () {
        $("#EditarOtroModal").modal("hide");
    });

    $(".close").click(function () {
        $("#EditarOtroModal").modal("hide");
    });

    $("#IdRegistroOtro").val(rid);
    $("#IdOtro").val(id);
    $("#ConceptoOtro").val($("td#o-" + id + "-Concepto").attr("data"));
    $("#ImporteOtro").val($("td#o-" + id + "-Importe").attr("data"));
    $("#MonedaOtro").val($("span#o-" + id + "-Moneda").attr("data"));
    
    $("#EditarOtroModal").modal("show");
}

function EliminarRegistro(rid) {
    $("#EliminarRegistroId").val(rid);

    if (confirm("Estas seguro que deseas eliminar el registro completo?")) {
        $("#frmEliminarRegistro").submit();
    }
}

function EliminarOtro(oid) {
    $("#EliminarOtroId").val(oid);

    if (confirm("Estas seguro que deseas eliminar?")) {
        $("#frmEliminarOtro").submit();
    }
}

function textAreaAdjust(element) {
    element.style.height = "1px";
    element.style.height = (25 + element.scrollHeight) + "px";
}

function autoResize(e) {
    e.style.height = 'auto';
    e.style.height = e.scrollHeight + 'px';
}

function autoResizeLive() {
    this.style.height = 'auto';
    this.style.height = e.scrollHeight + 'px';
}

$(document).ready(function () {

    if(window.location.pathname.includes("Entrada/Registrar")) {
        textarea = document.querySelector("#entradaNota");
        textarea.addEventListener('input', autoResizeLive, false);
        autoResize(textarea);
    }

    
});