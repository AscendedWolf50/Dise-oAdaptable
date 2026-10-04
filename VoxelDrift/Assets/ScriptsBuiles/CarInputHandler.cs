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
        Vector2 direccionLeida =  inputActions.Player.Move.ReadValue<Vector2>();

        inputAcelerador = direccionLeida.x;
        
        
    }
}
