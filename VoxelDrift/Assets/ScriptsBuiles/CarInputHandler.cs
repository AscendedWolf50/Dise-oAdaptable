using UnityEngine;
using UnityEngine.InputSystem;
using System;

public class CarInputHandler : MonoBehaviour
{
    
    private PlayerInputSystem inputActions;
    
    public float inputAcelerador {get; private set;} // Una varibale flotante que todos los scripts pueden leer (get) pero solo el script dueño puede modificar (private set)
    
    public static event Action OnSaltoEjecutado; //Evento publico que va a ser escuhado por el script de salto
    

    void Awake()
    {
        inputActions = new PlayerInputSystem();
    }

    void OnEnable()
    {
        inputActions.Enable();

        inputActions.Player.Jump.performed += OnSaltoPresionado; // Se suscribe al evento del input system, cuando recibe el evento del inputSystem ejecuta el metodo SaltoPresionado
    }

    void OnDisable()
    {
        inputActions.Disable();

        inputActions.Player.Jump.performed -= OnSaltoPresionado;
    }

    private void OnSaltoPresionado(InputAction.CallbackContext context) // El Metodo invoca el evento publico
    {
        OnSaltoEjecutado?.Invoke();
    }
    
    void Update()
    {
        Vector2 direccionLeida =  inputActions.Player.Move.ReadValue<Vector2>(); // Leer los valores del input system

        inputAcelerador = direccionLeida.x; // El input del acelerador es igual a el eje x de la direccion leida (el jugador solo puede acelerar horizontalmente)
        
        
    }
}
