using System;
using UnityEngine;

public class CarAudio : MonoBehaviour
{
    
    [SerializeField] private CarData data;
    
    [Header("Audio")]

    [SerializeField] private AudioSource sourceIdle;
    
    [SerializeField] private AudioSource sourceMid;
    
    [SerializeField] private AudioSource sourceAcelerando;
    
    [SerializeField] private AudioSource sourceFrenando;

    [Header("Parametros")] 
    [SerializeField] private float suavizadoCambiosVolumen;
    
    [SerializeField] private float volumenMotorEnAire;
    
    
    
    private CarInputHandler carInputHandler;
    
    private CarController carController;

    private void Awake()
    {
        carInputHandler = GetComponent<CarInputHandler>();
        
        carController = GetComponent<CarController>();
        
        sourceIdle.loop = true;
        
        sourceMid.loop = true;
        
        sourceAcelerando.loop = true;
        
        sourceFrenando.loop = true;
    }
    
    private void Start()
    {
        sourceIdle.volume = 1f;
        sourceMid.volume = 0f;
        sourceAcelerando.volume = 0f;
        sourceFrenando.volume = 0f;

        sourceIdle.Play();
        sourceMid.Play();
        sourceAcelerando.Play();
        sourceFrenando.Play();
    }
    
    
    void Update()
    {
        float velocidadNormalizada = Mathf.Clamp01(Mathf.Abs(carController.velocidadActual) / data.velocidadMaxima); // Limitar la velocidad normalizada a 0 y 1 para no desajustar los tonos del pitch de los audios

        float interpolacionPitch = Mathf.Lerp(0.8f, 1.5f,  velocidadNormalizada); // Cuando la velocidad normalizada sea 0, el pitch sera de 0.8 y caudno la velocidad sea 1, el pitch sera 1.5

        sourceIdle.pitch = interpolacionPitch;
        
        sourceMid.pitch = interpolacionPitch;
        
        sourceAcelerando.pitch = interpolacionPitch;

        float volumenObjetivoIdle = 0f;

        float volumenObjetivoMid = 0f;

        if (carController.EstaEnSuelo()) // Si el carro esta en el suelo el volumen se interpola de forma normal
        {
             volumenObjetivoIdle = 1f - velocidadNormalizada; 

             volumenObjetivoMid = velocidadNormalizada;
        }

        else //Pero si esta en el aire, se interpolapero con menor volumen para que no suene tan duro y constante
        {
            volumenObjetivoIdle = (1f - velocidadNormalizada) * volumenMotorEnAire;
            
            volumenObjetivoMid = velocidadNormalizada * volumenMotorEnAire;
        }
        
        sourceIdle.volume = Mathf.Lerp(sourceIdle.volume, volumenObjetivoIdle, Time.deltaTime * suavizadoCambiosVolumen); // A medida que la velociad va aumentando, el volumen de idle va disminuyendo
        
        sourceMid.volume = Mathf.Lerp(sourceMid.volume, volumenObjetivoMid, Time.deltaTime * suavizadoCambiosVolumen); // A medida que la velocidad aumenta, el volumen del mid tambien

       

       
        
        if (carInputHandler.inputAcelerador != 0 && carController.EstaEnSuelo())
        {
          sourceAcelerando.volume =  Mathf.Lerp(sourceAcelerando.volume, 1f, Time.deltaTime * suavizadoCambiosVolumen); //Si acelera y esta en el suelo, volumen de la aceleracion tambien aumenta
            
        }
        else
        {
            sourceAcelerando.volume = Mathf.Lerp(sourceAcelerando.volume, 0f, Time.deltaTime * suavizadoCambiosVolumen);
        }
        
        
        float volumenObjetivoFrenado = 0f;
        
        if (carController.EstaEnSuelo() && Mathf.Abs(carController.velocidadActual) > 1.0f && (carController.velocidadActual * carInputHandler.inputAcelerador) < 0f ) // Si esta e el suelo, el caro lleva bastante velocidad y, el input es opuesto a la direccion del carro
        {
            volumenObjetivoFrenado = 1f; // Si frena, el volumen objetivo es 1


        }

        else
        {
            volumenObjetivoFrenado = 0f; 
        }
        
        sourceFrenando.volume = Mathf.Lerp(sourceFrenando.volume, volumenObjetivoFrenado, Time.deltaTime * suavizadoCambiosVolumen); // Se aplica interpolacion lineal segun la condicion que se haya cumplido
        
    }
}
