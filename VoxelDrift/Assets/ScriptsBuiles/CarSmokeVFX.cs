using UnityEngine;

public class CarSmokeVFX : MonoBehaviour
{
    [SerializeField] private ParticleSystem [] particles;
    
    private CarInputHandler carInputHandler;
    
    private CarController carController;

    void Awake()
    {
        carInputHandler = GetComponent<CarInputHandler>();
        
        carController = GetComponent<CarController>();
    }
    
    void Update()
    {
        if (carInputHandler.inputAcelerador != 0 && carController.EstaEnSuelo() == true)
        {
            foreach (ParticleSystem particle in particles)
            {
                if (!particle.isPlaying)
                {
                    particle.Play();
                }
            }
        }
        else
        {
            foreach (ParticleSystem particle in particles)
            {
                if (particle.isPlaying)
                {
                    particle.Stop();
                }
            }
        }
    }
}
