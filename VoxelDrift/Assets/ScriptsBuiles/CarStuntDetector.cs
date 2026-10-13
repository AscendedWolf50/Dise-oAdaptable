using UnityEngine;
using System;


public class CarStuntDetector : MonoBehaviour
{
    [SerializeField] private float puntosPorGiro;

    [Tooltip("Mide el angulo maximo respecto al suelo que tiene permito tener el jugador cuando aterriza")]
    [SerializeField] private float anguloToleraciaTrucos;
    
    [Tooltip("Grados de regalo si aterriza bien pero le faltó un poco para los 360 grados")]
    [SerializeField] private float bufferGradosCompletado = 45f;
    
    
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
            
            float gradosConBuffer = Mathf.Abs(gradosAcumulados) + bufferGradosCompletado;
            
            int vueltasActuales = Mathf.FloorToInt(Mathf.Abs(gradosConBuffer) / 360); //Calcular las vueltas actuales mientras esta en el aire y no solo cuandoa aterriza

            if (vueltasActuales >= 1 && vueltasActuales != ultimasVueltasDetectadas) //Cuando el jugador empeiza a dar vueltas
            {
                ultimasVueltasDetectadas =  vueltasActuales; //La vueltas actuales pasan a ser las anteriores
                
                OnTrucoEnProgreso?.Invoke(vueltasActuales,puntosPorGiro); //Invocar el evento para notificar que hay un truco en progreso y pasar las vueltas que lleva y los puntos que dan
            }
            
            
        }
        else
        { 
            rotacionAnterior = transform.eulerAngles.z; //Para que las vueltas empiecen a contar exactamente desde la rotacion en que despego
            
            float gradosConBuffer = Mathf.Abs(gradosAcumulados) + bufferGradosCompletado; //APlicar los grados del buffer a los grados acumulados
            
            int vueltas = Mathf.FloorToInt(Mathf.Abs(gradosConBuffer) / 360);
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
            if (ultimasVueltasDetectadas >= 1 || Mathf.Abs(gradosAcumulados) >= 200f) // Si el jugador llevaba minimo una vuelta y se choca con el suelo (no aterriza con las ruedas, el truco falla)
            {
                float anguloInclinacion = Vector3.Angle(transform.up, Vector3.up);
                
                if (anguloInclinacion > anguloToleraciaTrucos) // Solo le salta el error de truco si el jugador sobrepasa los 200 grados de rotacion
                {
                    OnTrucoFallido?.Invoke();
                    gradosAcumulados = 0;
                    ultimasVueltasDetectadas = 0;
                }
            }
        }
    }
}
