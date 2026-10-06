using System;
using UnityEngine;

public class CarController : MonoBehaviour
{
    [SerializeField] private CarData data;

    [SerializeField] private Transform [] origenRaycast;

    [SerializeField] private Transform[] visualesRuedas;
    
    private float[] longitudesAnterioresResorte;
    
    private Rigidbody rb;
    
    private CarInputHandler  carInputHandler;

    private float aceleracion;

    private void Awake()
    {
         rb = GetComponent<Rigidbody>();
         
         carInputHandler = GetComponent<CarInputHandler>();

         rb.mass = data.masaVehiculo;

         rb.centerOfMass = data.offsetCentroDeMasa;
         
         longitudesAnterioresResorte = new float [origenRaycast.Length];
    }

    private bool EstaEnSuelo() //Metodo que retorna un booleano
    {
        bool enSuelo = false;
        foreach ( Transform puntoRaycast in origenRaycast)
        {
            Debug.DrawRay(puntoRaycast.position,  -puntoRaycast.up * data.longitudRaycasts, Color.red);
            
            if (Physics.Raycast(puntoRaycast.position, -puntoRaycast.up,
                    data.longitudRaycasts, data.layerSuelo)) // Para cada punto de origen generar un raycast
            {
                enSuelo = true; // Si cualquiera toca el suelo retornar true
            }
        }

        return enSuelo;
    }

    void Update()
    {
        aceleracion = carInputHandler.inputAcelerador; // La variable aceleracion es igual a la variable InputAcelerador en el script del handler (esta variable solo puede ser -1, 0 y 1
        
        Debug.Log($"Input recibido: {aceleracion}");
        
        
    }

    void FixedUpdate()
    {
        ProcesarSuspension();
        
        Debug.Log($"¿En suelo?: {EstaEnSuelo()}");
        
        if (EstaEnSuelo() == true) // Si el carro si esta en el suelo
        {
            
            
            float velocidadActual = Vector3.Dot(rb.linearVelocity, transform.right);

            if (aceleracion > 0 && velocidadActual < data.velocidadMaxima) // Si el jugador avanza
            {
                rb.AddForce(transform.right * data.fuerzaMotor, ForceMode.Force); 
            }

            if (aceleracion < 0 && velocidadActual > -data.velocidadMaximaReversa) // Si el jugador reversa
            {
                rb.AddForce(-transform.right * data.fuerzaReversa, ForceMode.Force);
            }

            if (aceleracion == 0) // Si el jugador no acelera se va frenando solo
            {
                rb.linearDamping = data.desaceleracionNatural;
            }
            else
            {
                rb.linearDamping = 0;
            }
        }

        else // Si no esta en el suelo
        {
            rb.linearDamping = 0; // Para que no pierda velocidad en el aire

            rb.angularDamping = data.friccionRotacionalAire; // Friccion rotacional en el aire para que el jugador no rote sin control en el aire, sino que vaya frenando su rotacion

            if (aceleracion != 0) // Si la aceleracion es distinta a 0 (osea que el jugador esta presionando los controles de direccion
            {
                rb.AddTorque(transform.forward * aceleracion * data.torqueEnElAire, ForceMode.Acceleration); //Para girar en el aire tocaria que el carro rote en el eje z, entonces aplicamos torque en el eje frontal (en 3d seria el eje z) lo multiplicamos para la aceleracion (para que gire cuando presiono las teclas de direccion) y por la fuerza de torque en el data
            }




        }
        
        
        
    }

    private void ProcesarSuspension()
    {
        for (int i = 0; i < origenRaycast.Length; i++)
        {
            float longitudActual;
            
            if (Physics.Raycast(origenRaycast[i].position, -transform.up, out RaycastHit hit,
                    data.longitudRaycasts, data.layerSuelo)) // Si el raycast golpea el suelo
                
            {
                longitudActual = hit.distance; // La longitud actual de los resortes es la distancia del golpe al inicio del raycast
                
                float desplazamiento =  data.distanciaMaxResorteReposo - longitudActual; // El desplazamiento del resorte al comprimirse es la longitud del resorte en reposo menos el punto del golpe del raycast
                
                float fuerzaResorte = data.constanteDeResorte * desplazamiento; // Para tener la fuerza del resorte, multiplicar ese desplazamiento por la constante del resorte
                
                float longitudAnterior = longitudesAnterioresResorte[i]; //Las longitudes anteriores de los resortes
                
                float velocidadResortes = (longitudActual - longitudAnterior)/ Time.fixedDeltaTime; //Para tener las velocidades de los resortes se resta la actual con la anterior y se divide por el tiempo
                
                float fuerzaAmortiguador = -data.constanteAmortiguador * velocidadResortes; // Para tener la fuerza del amortiguador se multiplica la constante de amortiguacion (negativa) por las velocidades de los resortes
                
                float fuerzaTotal = fuerzaAmortiguador + fuerzaResorte; //Sumar las fuerzas
                
                rb.AddForceAtPosition(transform.up * fuerzaTotal, origenRaycast[i].position, ForceMode.Force); //Aplicar la fuerza resultante al rigibody
                
                visualesRuedas[i].position = hit.point + (transform.up * data.radioRuedas); // Mover las ruedas visuales al punto donde choca el raycast + el radio de sus ruedas (Esto las mueve hacia arriba ya que su origen esta en el centro de las ruedas)
            }
            else
            {
                longitudActual = data.longitudRaycasts;
                
                visualesRuedas[i].position = origenRaycast[i].position - (transform.up * (longitudActual - data.radioRuedas)); // Si esta en el aire la posicion de las ruedas se extiende hasta abajo para hacer parecer de que se estira la suspension
            }

            longitudesAnterioresResorte[i] = longitudActual; // Tomar el antiguo valor actual y guardarlo en el arreglo de longitudes anteriores
        }
        
    }

    
    
}
