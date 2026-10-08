using System;
using UnityEngine;
using System.Collections.Generic;



[Serializable]
public class LevelProgress
{
    public string idNivel;
    public bool estrellaCompletado;
    public bool estrellaTiempo;
    public bool estrellaPuntos;
}

[Serializable]
public class SaveData
{
    public List<LevelProgress> niveles = new List<LevelProgress>();
}
