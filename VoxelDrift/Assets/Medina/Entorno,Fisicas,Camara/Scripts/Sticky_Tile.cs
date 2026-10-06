using UnityEngine;

public class Sticky_Tile : MonoBehaviour
{
    [SerializeField] private float stickyForce = 30f; // Fuerza que atrae el carro a la pared
    [SerializeField] private float maxAngleDifference = 25f; // Rango máximo de alineación
    [SerializeField] private float rotationSpeed = 10f; // Velocidad de alineación suave

    private void OnTriggerStay(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            Rigidbody rbCar = other.attachedRigidbody;
            if (rbCar == null) return;

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
}