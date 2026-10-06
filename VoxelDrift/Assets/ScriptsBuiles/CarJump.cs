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
            rb.linearVelocity = new Vector3(rb.linearVelocity.x, 0f, rb.linearVelocity.z); // Resetear la velocidad en y para que las caidas no le quiten potencia al salto
            
            rb.AddForce(transform.up * data.fuerzaSalto, ForceMode.Impulse);
        }
    }
    
    void Update()
    {
        
    }
}
