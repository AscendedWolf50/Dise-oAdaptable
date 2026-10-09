
using System;
using UnityEngine;

public class CarGrapple : MonoBehaviour
{
    [SerializeField] private CarData data;
    
    [SerializeField] private LayerMask layerPuntosEnganche;

    [SerializeField] private Transform puntoDeAgarreGancho;
    
    private CarController carController;
    
    public bool estaEnganchado = false;

    private Rigidbody rb;
    
    private Transform objetivoDeEnganche;

    private SpringJoint jointActual;
    
    [SerializeField] LineRenderer ganchovisual;

    void Awake()
    {
        carController = GetComponent<CarController>();
        
        rb = GetComponent<Rigidbody>();
    }
    
    void OnEnable()
    {
        CarInputHandler.OnSaltoEjecutado += PuedeEngancharse;
    }

    void OnDisable()
    {
        CarInputHandler.OnSaltoEjecutado -= PuedeEngancharse;
    }

    private void PuedeEngancharse()
    {
        if (carController.EstaEnSuelo() == true)
        {
            return;
        }
        else
        {
            if (estaEnganchado == true)
            {
                Desenganchar();
                
                return;
            }

            if (estaEnganchado == false)
            {
                float distanciaMasCercana = Mathf.Infinity; //Hacerlo infinito para que cualquier valor sea menor a el
                
                Transform objetivoMasCercana = null;
                
                Collider [] puntosEngancheEncontrados = Physics.OverlapSphere(transform.position, data.radioParaEngancharse, layerPuntosEnganche);

                foreach (Collider col in puntosEngancheEncontrados)
                {
                    Vector3 coordenadasColliders = col.ClosestPoint(transform.position); //Punto mas cercano comparado con la posicion del carro
                    
                    float distanciaConCarro = Vector3.Distance(transform.position, coordenadasColliders);

                    if (distanciaConCarro < distanciaMasCercana) //La distancia que sea MAS menor al infinito se convierte en la mas cercana
                    {
                        distanciaMasCercana = distanciaConCarro;
                        
                        objetivoMasCercana = col.transform;
                    }
                    
                }

                if (objetivoMasCercana != null)
                {
                    Enganchar(objetivoMasCercana);
                }
            }
        }
    }

    private void Enganchar(Transform objetivoMasCercano)
    {
        ganchovisual.enabled  = true;
        
        estaEnganchado = true;

        objetivoDeEnganche = objetivoMasCercano;
        
        jointActual = gameObject.AddComponent<SpringJoint>();
        
        jointActual.autoConfigureConnectedAnchor = false;
        
        jointActual.anchor = transform.InverseTransformPoint(puntoDeAgarreGancho.position);
        
        jointActual.connectedAnchor = objetivoDeEnganche.position;
        
        float distanciaActualConElCarro = Vector3.Distance(objetivoDeEnganche.position, puntoDeAgarreGancho.position);
        
        jointActual.minDistance = distanciaActualConElCarro;
        
        jointActual.maxDistance = distanciaActualConElCarro;
        
        jointActual.tolerance = 0f;

        jointActual.spring = data.fuerzaDeGancho;

        jointActual.damper = 0f;


    }
    
    private void Desenganchar()
    {
        ganchovisual.enabled  = false;
        
        
        
            Destroy(jointActual);
            
            estaEnganchado = false;
            
            objetivoDeEnganche = null;
        
        
    }
    
    
    void Update()
    {
        if (estaEnganchado == true && ganchovisual.enabled == true)
        {
            ganchovisual.SetPosition(0, puntoDeAgarreGancho.position);
            
            ganchovisual.SetPosition(1, objetivoDeEnganche.position);
        }

        if (carController.EstaEnSuelo() == true && estaEnganchado == true)
        {
            Desenganchar();
        }
    }

    private void FixedUpdate()
    {
        
        if (estaEnganchado == true)
        {
            rb.linearDamping = 0f;
            
            rb.angularDamping = 0f;
            
            Vector3 vectorDeLaCuerda = puntoDeAgarreGancho.position - objetivoDeEnganche.position;
            
            Vector3 vectorTangencial = Vector3.Cross(vectorDeLaCuerda, Vector3.forward).normalized;
            
            float direccionBalanceoActual = Vector3.Dot(rb.linearVelocity, vectorTangencial);
            
            float sentidoBalanceo = Mathf.Sign(direccionBalanceoActual);

            Vector3 direccionPendulo = vectorTangencial * sentidoBalanceo;

            float velocidadActual = rb.linearVelocity.magnitude;

            rb.linearVelocity = direccionPendulo * data.velocidadDeBalanceo;
            
            Vector3 direccionCapoAPuntoEnganche = (objetivoDeEnganche.position - puntoDeAgarreGancho.position).normalized;
            
            Quaternion rotacionObjetivo = Quaternion.FromToRotation(transform.up, direccionCapoAPuntoEnganche) * rb.rotation;
            
            rb.MoveRotation(rotacionObjetivo);
            
            
            
        }
    }

    void OnDrawGizmos()
    {
        Gizmos.color = Color.blue;
        
        Gizmos.DrawWireSphere(transform.position, data.radioParaEngancharse);
    }
}
