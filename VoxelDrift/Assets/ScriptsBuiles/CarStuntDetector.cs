using UnityEngine;
using System;

public class CarStuntDetector : MonoBehaviour
{
    [SerializeField] private float puntosPorGiro;

    [SerializeField] private float anguloToleraciaTrucos;
    
    private CarController carController;

    private float rotacionAnterior;

    private float gradosAcumulados;

    private bool estabaEnElAire;

    private int ultimasVueltasDetectadas = 0;
    
    public static event Action <float> OnPuntosGanados;
    
    public static event Action <int,float> OnTrucoEnProgreso;

    public static event Action OnTrucoFallido;

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
            
            int vueltasActuales = Mathf.FloorToInt(Mathf.Abs(gradosAcumulados) / 360); //Calcular las vueltas actuales mientras esta en el aire y no solo cuandoa aterriza

            if (vueltasActuales >= 1 && vueltasActuales != ultimasVueltasDetectadas) //Cuando el jugador empeiza a dar vueltas
            {
                ultimasVueltasDetectadas =  vueltasActuales; //La vueltas actuales pasan a ser las anteriores
                
                OnTrucoEnProgreso?.Invoke(vueltasActuales,puntosPorGiro); //Invocar el evento para notificar que hay un truco en progreso y pasar las vueltas que lleva y los puntos que dan
            }
            
            
        }
        else
        { 
            rotacionAnterior = transform.eulerAngles.z; //Para que las vueltas empiecen a contar exactamente desde la rotacion en que despego
            
            int vueltas = Mathf.FloorToInt(Mathf.Abs(gradosAcumulados) / 360);
            // Sacar el valor absoluto ya que si no se le hiciera y el jugador girara en sentido contrario (-360) la siguiente condicion no se cumpliria

            if (vueltas >= 1) // Si ha dado una o mas vueltas
            {
                float puntajeObtenido = vueltas * puntosPorGiro; //Cada vuelta otorga los puntos establecidos
                
                float anguloEntreVectores = Vector3.Angle(transform.up, Vector3.up); //Compara el vector de arriba local con el global para saber si el jugador esta en una postura optima para aterrizar

                if (anguloEntreVectores < anguloToleraciaTrucos)
                {
                    OnPuntosGanados?.Invoke(puntajeObtenido);
                }
                
                else 
                {
                    OnTrucoFallido?.Invoke();
                }
                
                
                
                

                
            }
            
            gradosAcumulados = 0;

            ultimasVueltasDetectadas = 0;


        } 
            
    }

    void OnCollisionEnter(Collision other)
    {
        if (other.gameObject.CompareTag("Suelo"))
        {
            if (ultimasVueltasDetectadas >= 1) // Si el jugador llevaba minimo una vuelta y se choca con el suelo (no aterriza con las ruedas, el truco falla)
            {
                OnTrucoFallido?.Invoke();
                
                gradosAcumulados = 0;

                ultimasVueltasDetectadas = 0;
            }
        }
    }
}
