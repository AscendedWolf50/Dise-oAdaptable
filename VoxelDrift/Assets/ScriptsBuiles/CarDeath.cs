using UnityEngine;
using System;
using System.Collections;
using MoreMountains.Feedbacks;

[System.Serializable]
public struct partesCarro
{
    public Transform transform;
    public Collider collider;
}

public class CarDeath : MonoBehaviour
{
    [SerializeField] private partesCarro[] partesDesprendibles;
    private Rigidbody rigibodyCarro;
    [SerializeField] private Collider puntoDebil;
    [SerializeField] private float fuerzaExplosionDesarme;
    [SerializeField] private float radioExplosionDesarme;
    [SerializeField] private float elevacionExplosionDesarme;
    
    [SerializeField] private MMF_Player feedbackMuerte;
    [SerializeField] private MMF_Player feedbackCaida;
    
    private CarController carController;
    private CarJump carJump;
    
    public static event Action OnCarroDestruido;
    // Nuevo evento para activar la cámara al momento del choque
    public static event Action OnCarImpactDeath; 

    void Awake()
    {
        carController = GetComponent<CarController>();
        carJump = GetComponent<CarJump>();
        rigibodyCarro = GetComponent<Rigidbody>();
    }

    void OnEnable()
    {
        DeathZone.OnPlayerFall += ProcesarCaidaAlVacio;
    }

    void OnDisable()
    {
        DeathZone.OnPlayerFall -= ProcesarCaidaAlVacio;
    }

    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Suelo"))
        {
            // Disparar la cámara de muerte inmediatamente
            OnCarImpactDeath?.Invoke(); 
            
            feedbackMuerte.PlayFeedbacks();

            puntoDebil.enabled = false;
            
            carController.enabled = false;
            carJump.enabled = false;
            
            StartCoroutine(rutinaDestruccion());

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
    }

    private void ProcesarCaidaAlVacio()
    {
        feedbackCaida.PlayFeedbacks();
        
        carController.enabled = false;
        carJump.enabled = false;

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