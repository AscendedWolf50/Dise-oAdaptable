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
                    data.longitudRaycasts, data.layerSuelo))
                
            {
                longitudActual = hit.distance;
                
                float desplazamiento =  data.distanciaMaxResorteReposo - longitudActual;
                
                float fuerzaResorte = data.constanteDeResorte * desplazamiento;
                
                float longitudAnterior = longitudesAnterioresResorte[i];
                
                float velocidadResortes = (longitudAnterior - longitudAnterior)/ Time.fixedDeltaTime;
                
                float fuerzaAmortiguador = -data.constanteAmortiguador * velocidadResortes;
                
                float fuerzaTotal = fuerzaAmortiguador + fuerzaResorte;
                
                rb.AddForceAtPosition(transform.up * fuerzaTotal, origenRaycast[i].position, ForceMode.Force);
                
                visualesRuedas[i].position = origenRaycast[i].position - (transform.up * longitudActual);
            }
            else
            {
                longitudActual = data.longitudRaycasts;
                
                visualesRuedas[i].position = origenRaycast[i].position - (transform.up * longitudActual);
            }

            longitudesAnterioresResorte[i] = longitudActual;
        }
        
    }

    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Start()
    {
        
    }

    // Update is called once per frame
    
}
