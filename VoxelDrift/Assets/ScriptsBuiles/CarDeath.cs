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

    // 1. Nos suscribimos al evento de caída que creamos en la DeathZone
    void OnEnable()
    {
        DeathZone.OnPlayerFall += ProcesarCaidaAlVacio;
    }

    void OnDisable()
    {
        DeathZone.OnPlayerFall -= ProcesarCaidaAlVacio;
    }

    // 2. Muerte por choque de cabeza (Se mantiene tal como lo programaste)
    void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Suelo"))
        {
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

    // 3. NUEVO: Muerte por caída al vacío
    private void ProcesarCaidaAlVacio()
    {
        // Desactivamos los scripts para que el jugador no intente acelerar o saltar mientras cae
        carController.enabled = false;
        carJump.enabled = false;

        // Invocamos la misma espera de 2 segundos para dar tiempo a que actúe la Camara_Muerte
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