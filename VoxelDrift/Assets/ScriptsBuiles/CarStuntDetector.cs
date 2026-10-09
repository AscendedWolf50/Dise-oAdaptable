using UnityEngine;
using System;

public class CarStuntDetector : MonoBehaviour
{
    [SerializeField] private float puntosPorGiro;
    
    private CarController carController;

    private float rotacionAnterior;

    private float gradosAcumulados;

    private bool estabaEnElAire;
    
    public static event Action <float> OnPuntosGanados;

    void Awake()
    {
        carController = GetComponent<CarController>();
    }
    
    void Update()
    {
        if (carController.EstaEnSuelo() == false)
        {
            float rotacionActual = transform.eulerAngles.z; //Obtener la rotacion actual
            
            float diferenciaAngulos = Mathf.DeltaAngle(rotacionAnterior, rotacionActual); // Determinar los angulos acumulados a atraves de la diferencia de las dos rotaciones
            
            gradosAcumulados +=  diferenciaAngulos;
            
            rotacionAnterior = rotacionActual; //La rotacion anterior pasa a ser la actual
        }
        else
        { 
            rotacionAnterior = transform.eulerAngles.z; //Para que las vueltas empiecen a contar exactamente desde la rotacion en que despego
            
            int vueltas = Mathf.FloorToInt(Mathf.Abs(gradosAcumulados) / 360);
            // Sacar el valor absoluto ya que si no se le hiciera y el jugador girara en sentido contrario (-360) la siguiente condicion no se cumpliria

            if (vueltas >= 1) // Si ha dado una o mas vueltas
            {
                float puntajeObtenido = vueltas * puntosPorGiro; //Cada vuelta otorga los puntos establecidos
                
                OnPuntosGanados?.Invoke(puntajeObtenido);

                
            }
            
            gradosAcumulados = 0;
           
           
        } 
            
    }
}
