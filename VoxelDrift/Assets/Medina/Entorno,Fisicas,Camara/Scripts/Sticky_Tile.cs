using System;
using UnityEngine;

public class Sticky_Tile : MonoBehaviour
{
    [SerializeField] private float stickyForce = 30f; // Fuerza que atrae el carro a la pared
    [SerializeField] private float maxAngleDifference = 25f; // Rango máximo de alineación
    [SerializeField] private float rotationSpeed = 10f; // Velocidad de alineación suave

    private bool isCarOnWall = false;
    // Evento global para avisarle a la cámara
    public static event Action<bool> OnWallTransition;
    
    // Contador para saber si estamos tocando MÁS de una baldosa de pared
    private static int stickyTilesActivos = 0; 

    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            stickyTilesActivos++;
            // Si es la PRIMERA baldosa que tocamos, cambiamos la cámara
            if (stickyTilesActivos == 1)
            {
                OnWallTransition?.Invoke(true);
            }
        }
    }

    private void OnTriggerStay(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            Rigidbody rbCar = other.attachedRigidbody;
            if (rbCar == null) return;

            isCarOnWall = true;

            // 1. Cancelar la gravedad global de Unity mientras esté en la pared (evita que caiga)
            rbCar.AddForce(-Physics.gravity, ForceMode.Acceleration);

            // 2. Aplicar la fuerza de adherencia contra la cara de la baldosa
            rbCar.AddForce(-transform.up * stickyForce, ForceMode.Acceleration);

            // 3. Alinear el 'up' del carro con la normal de la pared para que la suspensión funcione
            float angulo = Vector3.Angle(other.transform.up, transform.up);
            if (angulo <= maxAngleDifference)
            {
                Quaternion targetRotation = Quaternion.FromToRotation(other.transform.up, transform.up) * other.transform.rotation;
                other.transform.rotation = Quaternion.Slerp(other.transform.rotation, targetRotation, Time.deltaTime * rotationSpeed);
            }
        }
    }

    private void OnTriggerExit(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            isCarOnWall = false; // Tu variable original
            Rigidbody rbCar = other.attachedRigidbody;
            if (rbCar != null)
            {
                rbCar.linearVelocity = rbCar.linearVelocity; 
            }

            stickyTilesActivos--;
            // Si ya no tocamos NINGUNA baldosa de pared, volvemos a la cámara normal
            if (stickyTilesActivos <= 0)
            {
                stickyTilesActivos = 0; // Seguridad extra
                OnWallTransition?.Invoke(false);
            }
        }
    }
}