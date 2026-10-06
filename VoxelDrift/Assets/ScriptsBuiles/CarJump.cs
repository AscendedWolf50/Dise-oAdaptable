using UnityEngine;

public class CarJump : MonoBehaviour
{
    
    [SerializeField] private CarData data;
    
    private Rigidbody rb;
    
    private CarController carController;

    void Awake()
    {
        rb = GetComponent<Rigidbody>();
        
        carController = GetComponent<CarController>();
    }
    void OnEnable()
    {
        CarInputHandler.OnSaltoEjecutado += HacerSalto;
    }

    void OnDisable()
    {
        CarInputHandler.OnSaltoEjecutado -= HacerSalto;
    }

    private void HacerSalto()
    {
        if (carController.EstaEnSuelo() == true)
        {
            // 1. Proyecta y extrae únicamente la velocidad que lleva el carro en su eje 'up' local
            Vector3 velocidadPerpendicular = Vector3.Project(rb.linearVelocity, transform.up);
        
            // 2. Se la resta a la velocidad actual para limpiar fuerzas de caída o pegado sin frenar el avance
            rb.linearVelocity -= velocidadPerpendicular; 
        
            // 3. Aplica el impulso de salto hacia afuera
            rb.AddForce(transform.up * data.fuerzaSalto, ForceMode.Impulse);
        }
    }
    
    void Update()
    {
        
    }
}
