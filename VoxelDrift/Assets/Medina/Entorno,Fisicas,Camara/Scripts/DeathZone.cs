using System;
using UnityEngine;

public class DeathZone : MonoBehaviour
{
    // Evento global para avisar que el jugador cayó al vacío
    public static event Action OnPlayerFall;

    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            OnPlayerFall?.Invoke();
        }
    }
}