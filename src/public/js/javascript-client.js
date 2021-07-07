;<script>

function lockFunction() {
  bootbox.confirm({
    title: "Atenção!",
    message: "<i class='fas fa-exclamation-triangle fa-lg fa-fw'></i> Tem certeza que deseja remover essa reserva?",
    size: "small",
    onEscape: true,
    backdrop: true,
    buttons: {
      cancel: {
        className: 'btn-danger',
        label: '<i class="fa fa-times"></i> Não'
      },
      confirm: {
        className: 'btn-success',
        label: '<i class="fa fa-check"></i> Sim'
      }
    },

    callback: function (result) {
      if (result === true) {
        document
          .getElementById("myForm")
          .submit();

      }
    }
  });
}
</script>
