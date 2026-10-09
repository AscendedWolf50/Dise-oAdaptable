using UnityEngine;

using System;

public class FinishLine : MonoBehaviour
{

    public static event Action OnNivelCompletado;
    
    
   private void OnTriggerEnter(Collider other)
    {
        if(other.CompareTag("Player"))
        {
            OnNivelCompletado?.Invoke();
        }
    }
    // Start is called once before the first execution of Update after the MonoBehaviour is created
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }
}
