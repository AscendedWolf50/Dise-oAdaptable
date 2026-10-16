mergeInto(LibraryManager.library, {
  
  AvisarNivelCompletadoJS: function (estrellas) {
    
    if (window.OnNivelCompletado) {
      window.OnNivelCompletado(estrellas);
    }
  }

});