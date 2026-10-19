using UnityEngine;

public class CameraTargetOffset : MonoBehaviour
{
    [Header("Referencias")]
    [SerializeField] private Rigidbody carRigidbody;
    [SerializeField] private Transform targetPivot; // Asigna aquí el GameObject 'CameraLookTarget'

    [Header("Ajustes de Desplazamiento")]
    [SerializeField] private float offsetDistance = 3.0f;
    [SerializeField] private float lerpSpeed = 4.0f;
    [SerializeField] private float velocityThreshold = 0.2f;

    private float initialLocalX;

    private void Start()
    {
        if (targetPivot != null)
        {
            initialLocalX = targetPivot.localPosition.x;
        }
    }

    private void Update()
    {
        if (carRigidbody == null || targetPivot == null) return;

        // Detectar velocidad en el eje de movimiento (ej: X)
        float currentVelocity = carRigidbody.linearVelocity.x; 
        float targetX = initialLocalX;

        if (currentVelocity > velocityThreshold)
        {
            // Al avanzar hacia adelante, mover el punto de enfoque hacia atrás
            targetX = initialLocalX - offsetDistance;
        }
        else if (currentVelocity < -velocityThreshold)
        {
            // Al retroceder, mover el punto de enfoque hacia adelante
            targetX = initialLocalX + offsetDistance;
        }

        // Interpolar la posición local del pivot suavemente
        Vector3 localPos = targetPivot.localPosition;
        localPos.x = Mathf.Lerp(localPos.x, targetX, Time.deltaTime * lerpSpeed);
        targetPivot.localPosition = localPos;
    }
}