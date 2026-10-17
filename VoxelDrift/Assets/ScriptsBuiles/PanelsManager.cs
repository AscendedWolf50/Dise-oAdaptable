using TMPro;
using UnityEngine;

public class PanelsManager : MonoBehaviour
{
    [SerializeField] private LevelManager levelManager;
    [SerializeField] private TextMeshProUGUI textoCronometro;
    [SerializeField] private TextMeshProUGUI textoPuntos;

    void OnEnable()
    {
        CarDeath.OnCarroDestruido += ActivarPanelDerrota;
        FinishLine.OnNivelCompletado += ActivarPanelVictoria;
    }

    void OnDisable()
    {
        CarDeath.OnCarroDestruido -= ActivarPanelDerrota;
        FinishLine.OnNivelCompletado -= ActivarPanelVictoria;
    }

    public void ActivarPanelVictoria()
    {
        
        int estrellas = levelManager.CalcularEstrellas();
        
        
        WebBridgeManager.Instancia.FinalizarNivel(estrellas);
    }

    public void ActivarPanelDerrota()
    {
        
        WebBridgeManager.Instancia.NivelFallido();
    }

    void Update()
    {
        float tiempoParaMostrar = levelManager.tiempoActual;
        textoCronometro.text = "Tiempo:" + tiempoParaMostrar.ToString("F2"); //Mostar solo dos decimales

        float puntajeParaMostrar = levelManager.puntosTotales;
        textoPuntos.text = "Puntos:" + puntajeParaMostrar.ToString("F2");
    }
}