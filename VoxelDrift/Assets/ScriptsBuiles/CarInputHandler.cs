using UnityEngine;
using UnityEngine.InputSystem;

public class CarInputHandler : MonoBehaviour
{
    
    private PlayerInputSystem inputActions;
    
    public float inputAcelerador {get; private set;} // Una varibale flotante que todos los scripts pueden leer (get) pero solo el script dueño puede modificar (private set)

    void Awake()
    {
        inputActions = new PlayerInputSystem();
    }

    void OnEnable()
    {
        inputActions.Enable();
    }

    void OnDisable()
    {
        inputActions.Disable();
    }
    
    void Update()
    {
        Vector2 direccionLeida =  inputActions.Player.Move.ReadValue<Vector2>(); // Leer los valores del input system

        inputAcelerador = direccionLeida.x; // El input del acelerador es igual a el eje x de la direccion leida (el jugador solo puede acelerar horizontalmente)
        
        
    }
}
