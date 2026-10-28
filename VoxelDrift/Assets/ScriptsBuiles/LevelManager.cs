using System;
using UnityEngine;
using MoreMountains.Feedbacks;
using System.Runtime.InteropServices;

public class LevelManager : MonoBehaviour
{
    [SerializeField] private LevelData data;

    public float tiempoActual { get; private set; } = 0f;
    
    public float puntosTotales {get; private set;} = 0;   
    
    private bool nivelTerminado = false;
    
    [Header("Feedback")]
    
    [SerializeField] private MMF_Player feedbackObtenerPuntos;
    
    [DllImport("__Internal")]
    private static extern void SincronizarProgresoWebJS(string json);


    void OnEnable()
    {
        FinishLine.OnNivelCompletado += ProcesarCompletacion;

        CarStuntDetector.OnPuntosGanados += SumarPuntos;
    }

    void OnDisable()
    {
        FinishLine.OnNivelCompletado -=  ProcesarCompletacion;
        
        CarStuntDetector.OnPuntosGanados -= SumarPuntos;
    }

    
    public int CalcularEstrellas()
    {
        int totalEstrellas = 1; 

        if (tiempoActual <= data.tiempoParaEstrella)
        {
            totalEstrellas++;
        }
        if (puntosTotales >= data.puntosParaEstrella)
        {
            totalEstrellas++;
        }

        return totalEstrellas;
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

        if (puntosTotales >= data.puntosParaEstrella)
        {
            progresoActual.estrellaPuntos = true;
        }
        
        if (tiempoActual < progresoActual.mejorTiempo || progresoActual.mejorTiempo <= 0 || progresoActual.ghostData == null)
        {
            progresoActual.mejorTiempo = tiempoActual;
            if (GhostManager.Instancia != null)
            {
                progresoActual.ghostData = GhostManager.Instancia.ObtenerGrabacionActual(data.idNivel, tiempoActual);
            }
        }
        
        GuardarDatos(datosGuardados);
        
        int estrellas = CalcularEstrellas();

    #if UNITY_WEBGL && !UNITY_EDITOR
                if (WebBridgeManager.Instancia != null)
                {
                    WebBridgeManager.Instancia.FinalizarNivel(estrellas);
                }
    #else
            Debug.Log($"=== RESUMEN NIVEL: {data.idNivel} ===\n" +
                      $" Estrella 1 (Completar): {(progresoActual.estrellaCompletado ? "CONSEGUIDA" : "NO")}\n" +
                      $" Estrella 2 (Tiempo): {(progresoActual.estrellaTiempo ? "CONSEGUIDA" : "FALLADA")} " +
                      $"({tiempoActual:F2}s / {data.tiempoParaEstrella:F2}s Objetivo)\n" +
                      $" Estrella 3 (Puntos): {(progresoActual.estrellaPuntos ? "CONSEGUIDA" : "NO")}");
    #endif
        
        
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
        
        #if UNITY_WEBGL && !UNITY_EDITOR
                    SincronizarProgresoWebJS(json);
        #else
                Debug.Log("[SIMULACIÓN WEB] Progreso sincronizado con React: " + json);
        #endif
    }

    private void SumarPuntos(float puntajeRecibido)
    {
        feedbackObtenerPuntos.PlayFeedbacks();
        
        puntosTotales += puntajeRecibido;
    }

    private void Update()
    {
        if (nivelTerminado == false)
        {
            tiempoActual += Time.deltaTime;
        }
    }
    
    
}
