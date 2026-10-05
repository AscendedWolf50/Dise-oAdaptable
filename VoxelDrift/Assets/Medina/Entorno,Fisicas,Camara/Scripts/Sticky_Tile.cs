using UnityEngine;

public class Sticky_Tile : MonoBehaviour
{
    private void OnTriggerStay(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            // La normal de la cara de esta baldosa es su transform.up (flecha verde)
            Vector3 surfaceNormal = transform.up;

            // Aquí le pasamos la normal al componente del carro que gestiona la gravedad.
            // (Acuerda con Dev 1 el nombre de esta variable o método)
            if (other.attachedRigidbody != null)
            {
                // Ejemplo de llamada limpia al script de gravedad del carro:
                // var gravityHandler = other.attachedRigidbody.GetComponent<CarGravity>();
                // if (gravityHandler != null) gravityHandler.SetTargetNormal(surfaceNormal);
            }
        }
    }

    private void OnTriggerExit(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            // Al salir de la pared, devolvemos la gravedad a la normalidad (hacia arriba)
            // gravityHandler.SetTargetNormal(Vector3.up);
        }
    }
}