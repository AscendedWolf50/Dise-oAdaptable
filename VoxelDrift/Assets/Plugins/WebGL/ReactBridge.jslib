mergeInto(LibraryManager.library, {
  
  AvisarNivelCompletadoJS: function(estrellas) {
    if (window.ReactBridge_NivelCompletado) {
      window.ReactBridge_NivelCompletado(estrellas);
    }
  },

  AbrirMenuPausaJS: function() {
    if (window.ReactBridge_AbrirPausa) {
      window.ReactBridge_AbrirPausa();
    }
  }

});