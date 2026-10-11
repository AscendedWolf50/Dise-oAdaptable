using System;
using UnityEngine;
using MoreMountains.Feedbacks;
using TMPro;
using System.Collections;

public class TrickHUD : MonoBehaviour
{
    
[SerializeField] private TextMeshProUGUI textoTrucos;

[SerializeField] private CanvasGroup canvasGroupTrucos;

[SerializeField] private float tiempoEsperaEnSuelo;

[Header("Componentes de feel")]
[SerializeField] private MMF_Player feedbackGiroEnAire;

[SerializeField] private MMF_Player feedbackAterrizaje;

[SerializeField] private MMF_Player feedbackDesaparecer;


private Coroutine rutinaAterrizaje;


void OnEnable()
{
    CarStuntDetector.OnTrucoEnProgreso += ProcesarTruco;

    CarStuntDetector.OnPuntosGanados += ProcesarAterrizaje;

    CarDeath.OnCarroDestruido += CancelarTrucoPorMuerte;
}

void OnDisable()
{
    CarStuntDetector.OnTrucoEnProgreso -= ProcesarTruco;
    
    CarStuntDetector.OnPuntosGanados -= ProcesarAterrizaje;
    
    CarDeath.OnCarroDestruido -= CancelarTrucoPorMuerte;
}

private void Awake()
{
    canvasGroupTrucos.alpha = 0;
}

private void ProcesarTruco(int vueltas, float puntosPorGiro)
{
    if (rutinaAterrizaje != null) // Si ya habia una rutina ejecutandose detenerla para ejecutar una nueva
    {
        StopCoroutine(rutinaAterrizaje);
    }
    
    canvasGroupTrucos.alpha = 1;

    textoTrucos.text = $"{vueltas * 360}° FLIP x{vueltas}   <color=#FFD700>{vueltas * puntosPorGiro}</color> PTS";
    
    if (feedbackGiroEnAire != null)
    {
        feedbackGiroEnAire.PlayFeedbacks();
    }


}

private void ProcesarAterrizaje(float puntos)
{
    if (rutinaAterrizaje != null)
    {
        StopCoroutine(rutinaAterrizaje);
    }
    rutinaAterrizaje = StartCoroutine(RutinaAtterizaje());
}

private IEnumerator RutinaAtterizaje()
{
    feedbackAterrizaje.PlayFeedbacks();
    
    yield return new WaitForSeconds(tiempoEsperaEnSuelo);
    
    feedbackDesaparecer.PlayFeedbacks();
}

private void CancelarTrucoPorMuerte()
{
    if (rutinaAterrizaje != null)
    {
        StopCoroutine(rutinaAterrizaje);
    }
    
    canvasGroupTrucos.alpha = 0;
}


}
