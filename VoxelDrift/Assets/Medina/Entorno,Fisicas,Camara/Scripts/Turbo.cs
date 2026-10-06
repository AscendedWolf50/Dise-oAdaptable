using System;
using UnityEngine;

public class Turbo : MonoBehaviour
{
    [SerializeField] private float boostForce= 100f;

    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            Rigidbody rbCar = other.attachedRigidbody;
            if (rbCar != null)
            {
                rbCar.AddForce(transform.right * boostForce, ForceMode.Acceleration); 
            }
            
        }  
    }
}
