
using UnityEngine;
using MoreMountains.Feedbacks;
using TMPro;
using System.Collections;


public class TrickHUD : MonoBehaviour
{
    
[SerializeField] private TextMeshProUGUI textoTrucos;

[SerializeField] private CanvasGroup canvasGroupTrucos;

[SerializeField] private float tiempoEsperaEnSuelo;

[SerializeField] private string [] opcionesTextoTucoFallido;

[Header("Componentes de feel")]
[SerializeField] private MMF_Player feedbackGiroEnAire;

[SerializeField] private MMF_Player feedbackAterrizaje;

[SerializeField] private MMF_Player feedbackDesaparecer;

[SerializeField] private MMF_Player feedbackTrucoFallido;


private Coroutine rutinaAterrizaje;


void OnEnable()
{
    CarStuntDetector.OnTrucoEnProgreso += ProcesarTruco;

    CarStuntDetector.OnPuntosGanados += ProcesarAterrizaje;

    CarStuntDetector.OnTrucoFallido += ProcesarFallo;

    CarDeath.OnCarroDestruido += CancelarTrucoPorMuerte;
}

void OnDisable()
{
    CarStuntDetector.OnTrucoEnProgreso -= ProcesarTruco;
    
    CarStuntDetector.OnPuntosGanados -= ProcesarAterrizaje;
    
    CarStuntDetector.OnTrucoFallido -= ProcesarFallo;
    
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

private void ProcesarFallo()
{
    if (rutinaAterrizaje != null)
    {
        StopCoroutine(rutinaAterrizaje);
    }
    
    canvasGroupTrucos.alpha = 1;
    
    int indiceEscogido = UnityEngine.Random.Range(0, opcionesTextoTucoFallido.Length);
    
    string textoSeleccionado = opcionesTextoTucoFallido[indiceEscogido];
    
    textoTrucos.text = $"<color=#FF0000>{textoSeleccionado}</color>";
    
    feedbackTrucoFallido.PlayFeedbacks();
    
    rutinaAterrizaje = StartCoroutine(RutinaFallo());
    
}

private IEnumerator RutinaFallo()
{
    yield return new WaitForSeconds(tiempoEsperaEnSuelo);
    
    feedbackDesaparecer.PlayFeedbacks();
}


}
