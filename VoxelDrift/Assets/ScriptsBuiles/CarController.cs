using System;
using UnityEngine;

public class CarController : MonoBehaviour
{
    [SerializeField] private CarData data;

    [SerializeField] private Transform origenRaycast;
    
    private Rigidbody rb;
    
    private CarInputHandler  carInputHandler;

    private float aceleracion;

    private void Awake()
    {
         rb = GetComponent<Rigidbody>();
         
         carInputHandler = GetComponent<CarInputHandler>();

         rb.mass = data.masaVehiculo;

         rb.centerOfMass = data.offsetCentroDeMasa;
    }

    private bool EstaEnSuelo()
    {
       bool enSuelo = Physics.Raycast(origenRaycast.position, -origenRaycast.up, data.distacionRaycastAlSuelo, data.layerSuelo); //Un booleano que es true si el raycast golpea el suelo
        
        Debug.DrawRay(origenRaycast.position,  -origenRaycast.up * data.distacionRaycastAlSuelo, Color.red);

        return enSuelo; // Renor
    }

    void Update()
    {
        aceleracion = carInputHandler.inputAcelerador;
        
        Debug.Log($"Input recibido: {aceleracion}");
        
        
    }

    void FixedUpdate()
    {
        Debug.Log($"¿En suelo?: {EstaEnSuelo()}");
        if (EstaEnSuelo() == true)
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
        
    }

    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Start()
    {
        
    }

    // Update is called once per frame
    
}
