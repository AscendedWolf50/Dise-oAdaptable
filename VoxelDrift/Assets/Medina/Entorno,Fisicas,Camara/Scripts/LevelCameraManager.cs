using UnityEngine;
using Unity.Cinemachine;

public class LevelCameraManager : MonoBehaviour
{
    [SerializeField] private CinemachineCamera camaraSuelo;
    [SerializeField] private CinemachineCamera camaraPared;
    [SerializeField] private CinemachineCamera camaraMuerte;

    private void OnEnable()
    {
        Sticky_Tile.OnWallTransition += AlternarCamaraPared;
        DeathZone.OnPlayerFall += ActivarCamaraMuerte;
    }

    private void OnDisable()
    {
        Sticky_Tile.OnWallTransition -= AlternarCamaraPared;
        DeathZone.OnPlayerFall -= ActivarCamaraMuerte;
    }

    private void AlternarCamaraPared(bool enPared)
    {
        // La pared tiene prioridad 20 (le gana al 10 del suelo)
        camaraPared.Priority = enPared ? 20 : 0; 
    }

    private void ActivarCamaraMuerte()
    {
        // La muerte tiene prioridad 30 (le gana a la pared y al suelo)
        camaraMuerte.Priority = 30;
        
        // Opcional: Aquí podrías invocar también un GameManager para 
        // reiniciar el nivel después de 2 o 3 segundos.
    }
}