using System;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.LowLevel;
using UnityEngine.EventSystems;

public class TouchControlsAutoHider : MonoBehaviour
{
    
    private CanvasGroup panelInputsTactiles;
    
    [SerializeField] private float velocidadDeDesvanecimiento;
    
    private bool mostrarControles = true;

    void Awake()
    {
        panelInputsTactiles = GetComponent<CanvasGroup>();
    }

    void OnEnable()
    {
        InputSystem.onEvent += DeteccionTactil;
    }

    void OnDisable()
    {
        InputSystem.onEvent -= DeteccionTactil;
    }


    private void DeteccionTactil(InputEventPtr evennto, InputDevice dispositivo)
    {
        if (dispositivo is Touchscreen || dispositivo is Mouse)
        {
            mostrarControles = true;
            
            return;
        }
        
        if (dispositivo is Keyboard)
        {
            if (EventSystem.current != null && EventSystem.current.IsPointerOverGameObject()) // Si el cursor o el dedo estan sobre el boton, los botones no se ocultan
            {
                return;
            }
            mostrarControles = false;
        }

        
    }
    

   
    void Update()
    {
        if (mostrarControles == true)
        {
            panelInputsTactiles.alpha = Mathf.MoveTowards(panelInputsTactiles.alpha, 1, Time.deltaTime * velocidadDeDesvanecimiento);
        }

        else
        {
            panelInputsTactiles.alpha = Mathf.MoveTowards(panelInputsTactiles.alpha, 0, Time.deltaTime * velocidadDeDesvanecimiento);
        }
        
        bool esVisible = panelInputsTactiles.alpha >= 0.1f;

        panelInputsTactiles.interactable = esVisible;
        panelInputsTactiles.blocksRaycasts = esVisible; // La capacidad de bloquear raycasts depende de el estado de la variable esVisible
        
    }
}
