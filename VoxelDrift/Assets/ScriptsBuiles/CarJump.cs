using UnityEngine;
using MoreMountains.Feedbacks;

public class CarJump : MonoBehaviour
{
    
    [SerializeField] private CarData data;
    
    [Header("FeedBack")]
    [SerializeField] private MMF_Player feedbackSalto;
    
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
            
            Vector3 velocidadPerpendicular = Vector3.Project(rb.linearVelocity, transform.up);
        
            
            rb.linearVelocity -= velocidadPerpendicular; 
            
            feedbackSalto.PlayFeedbacks();
            
            rb.AddForce(transform.up * data.fuerzaSalto, ForceMode.Impulse);
        }
    }
    
    
}
