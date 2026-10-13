using MoreMountains.Feedbacks;
using UnityEngine;
using Unity.Cinemachine;

public class LevelCameraManager : MonoBehaviour
{
    [SerializeField] private CinemachineCamera camaraSuelo;
    [SerializeField] private CinemachineCamera camaraPared;
    [SerializeField] private CinemachineCamera camaraMuerte;
    
    private void Start()
    {
        // Forzar la cámara suelo como principal al iniciar o reaparecer
        camaraSuelo.Priority = 10;
        camaraPared.Priority = 0;
        camaraMuerte.Priority = 0;
    }

    private void OnEnable()
    {
        Sticky_Tile.OnWallTransition += AlternarCamaraPared;
        DeathZone.OnPlayerFall += ActivarCamaraMuerte;
        CarDeath.OnCarImpactDeath += ActivarCamaraMuerte; // Escuchar el choque contra el suelo
    }

    private void OnDisable()
    {
        Sticky_Tile.OnWallTransition -= AlternarCamaraPared;
        DeathZone.OnPlayerFall -= ActivarCamaraMuerte;
        CarDeath.OnCarImpactDeath -= ActivarCamaraMuerte; // Limpiar suscripción
    }

    private void AlternarCamaraPared(bool enPared)
    {
        camaraPared.Priority = enPared ? 20 : 0; 
    }

    private void ActivarCamaraMuerte()
    {
        camaraMuerte.Priority = 30;
    }
}