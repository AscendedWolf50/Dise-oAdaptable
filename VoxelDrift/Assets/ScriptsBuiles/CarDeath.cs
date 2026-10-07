using UnityEngine;
using System;
using System.Collections;

[System.Serializable]
public struct partesCarro
{
    public Transform transform;

    public Collider collider;
    
}
public class CarDeath : MonoBehaviour
{
    
    [SerializeField] private partesCarro [] partesDesprendibles;
    
    private Rigidbody rigibodyCarro;
    
    [SerializeField] private Collider puntoDebil;
    
    [SerializeField] private float fuerzaExplosionDesarme;

    [SerializeField] private float radioExplosionDesarme;

    [SerializeField] private float elevacionExplosionDesarme;
    
    private CarController carController;
    
    private CarJump carJump;
    
    public static event Action OnCarroDestruido;
    

    void Awake()
    {
        carController = GetComponent<CarController>();
        
        carJump = GetComponent<CarJump>();
        
        rigibodyCarro = GetComponent<Rigidbody>();
    }

    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Suelo"))
        {
            carController.enabled = false;
            
            carJump.enabled = false;

            foreach (partesCarro parte in partesDesprendibles)
            {
                Rigidbody rb;
                
                parte.transform.parent = null;
                
                parte.collider.enabled = true;
                
                rb = parte.transform.gameObject.AddComponent<Rigidbody>();
                
                rb.linearVelocity = rigibodyCarro.linearVelocity;
                
                rb.AddExplosionForce(fuerzaExplosionDesarme, transform.position, radioExplosionDesarme, elevacionExplosionDesarme, ForceMode.Impulse);
            }
        }

        StartCoroutine(rutinaDestruccion());


    }

    private IEnumerator rutinaDestruccion()
    {
        yield return new WaitForSeconds(2f);
        
        EnviarEventoAManager();
    }

    private void EnviarEventoAManager()
    {
        OnCarroDestruido?.Invoke();
    }
}
