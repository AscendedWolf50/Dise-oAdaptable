using System;
using System.Collections.Generic;
using UnityEngine;

[Serializable]
public class GhostFrame
{
    public float t; // Tiempo en segundos
    public Vector3 p; // Posición
    public Vector3 r; // Rotación en Euler
}

[Serializable]
public class LevelGhostData
{
    public string idNivel;
    public float mejorTiempo;
    public int colorCarro;
    public List<GhostFrame> frames = new List<GhostFrame>();
}