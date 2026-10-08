using UnityEngine;

[CreateAssetMenu(fileName = "CarData", menuName = "Scriptable Objects/CarData")]
public class CarData : ScriptableObject
{
    public float fuerzaMotor;

    public float fuerzaReversa;

    public float velocidadMaxima;
    
    public float velocidadMaximaReversa;

    public float fuerzaSalto;

    public float desaceleracionNatural;

    public float torqueEnElAire;

    public float friccionRotacionalAire;

    public float masaVehiculo;

    public Vector3 offsetCentroDeMasa;
    
    public float longitudRaycasts;

    public float radioRuedas;

    public float constanteDeResorte;
    
    public LayerMask layerSuelo;
    
    public float distanciaMaxResorteReposo;
    
    public float constanteAmortiguador;

    public float radioParaEngancharse;

    public float fuerzaDeGancho;
}
