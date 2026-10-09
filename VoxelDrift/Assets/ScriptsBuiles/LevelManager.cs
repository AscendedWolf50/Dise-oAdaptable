using System;
using UnityEngine;

public class LevelManager : MonoBehaviour
{
    [SerializeField] private LevelData data;

    public float tiempoActual { get; private set; } = 0f;
    
    private bool nivelTerminado = false;


    void OnEnable()
    {
        FinishLine.OnNivelCompletado += ProcesarCompletacion;
    }

    void OnDisable()
    {
        FinishLine.OnNivelCompletado -=  ProcesarCompletacion;
    }



    private void ProcesarCompletacion()
    {
        nivelTerminado = true;
        
        SaveData datosGuardados = CargarDatos();
        
        LevelProgress progresoActual = datosGuardados.niveles.Find(n => n.idNivel == data.idNivel); //Buscar si ya tiene un registro en el nivel

        if (progresoActual == null)
        {
            progresoActual = new LevelProgress{idNivel = data.idNivel};
            
            datosGuardados.niveles.Add(progresoActual);
        }

        progresoActual.estrellaCompletado = true;

        if (tiempoActual <= data.tiempoParaEstrella)
        {
            progresoActual.estrellaTiempo = true;
        }
        
        GuardarDatos(datosGuardados);
        
        Debug.Log($"=== RESUMEN NIVEL: {data.idNivel} ===\n" +
                  $" Estrella 1 (Completar): {(progresoActual.estrellaCompletado ? "CONSEGUIDA" : "NO")}\n" +
                  $" Estrella 2 (Tiempo): {(progresoActual.estrellaTiempo ? "CONSEGUIDA" : "FALLADA")} " +
                  $"({tiempoActual:F2}s / {data.tiempoParaEstrella:F2}s Objetivo)\n" +
                  $" Estrella 3 (Puntos): {(progresoActual.estrellaPuntos ? "CONSEGUIDA" : "NO")}");
        
        
    }


    private SaveData CargarDatos()
    {
        if (PlayerPrefs.HasKey("UserProgress"))
        {
            string json = PlayerPrefs.GetString("UserProgress");
            
            return  JsonUtility.FromJson<SaveData>(json);
        }
        
        return new SaveData();
    }

    private void GuardarDatos(SaveData datos)
    {
        string json = JsonUtility.ToJson(datos);
        PlayerPrefs.SetString("UserProgress", json);
        PlayerPrefs.Save();
    }

    private void Update()
    {
        if (nivelTerminado == false)
        {
            tiempoActual += Time.deltaTime;
        }
    }
}
